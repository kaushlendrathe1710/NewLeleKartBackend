import crypto from 'crypto';
import dotenv from 'dotenv';
import WooCommerce from '../config/woocommerce.js';
import razorpay from '../config/razorpay.js';

dotenv.config();

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

function validateWebhookSignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

async function updateWooCommerceOrder(orderId, status) {
  try {
    await WooCommerce.put(`orders/${orderId}`, {
      status: status
    });
    console.log(`Updated WooCommerce order ${orderId} to ${status}`);
  } catch (error) {
    console.error(`Failed to update WooCommerce order ${orderId}:`, error);
    throw error;
  }
}

export const createOrder = async (req, res) => {
  try {
    const { line_items, currency = 'INR', payment_method, coupon_lines } = req.body;
    const customerId = req.user.id;

    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return res.status(400).json({
        message: 'Missing or invalid line_items'
      });
    }

    if (!payment_method || !['cod', 'razorpay'].includes(payment_method)) {
      return res.status(400).json({
        message: 'Invalid payment_method. Must be either "cod" or "razorpay"'
      });
    }

    // Fetch customer data to get billing and shipping addresses
    const customer = await WooCommerce.get(`customers/${customerId}`);

    // Create WooCommerce order
    const orderData = {
      customer_id: customerId,
      payment_method,
      billing: customer.data.billing,
      shipping: customer.data.shipping,
      line_items: line_items,
      status: payment_method === 'cod' ? 'processing' : 'pending'
    };

    // Add coupon lines if provided
    if (coupon_lines && Array.isArray(coupon_lines) && coupon_lines.length > 0) {
      orderData.coupon_lines = coupon_lines.map(code => ({ code }));
    }

    const wooOrder = await WooCommerce.post('orders', orderData);

    if (payment_method === 'cod') {
      // For COD, return just the WooCommerce order
      return res.status(200).json({
        wooCommerceOrder: wooOrder.data
      });
    } else {
      // For Razorpay, create payment order
      const orderTotal = Math.round(parseFloat(wooOrder.data.total) * 100); // Convert to paise
      
      const razorpayOrder = await razorpay.orders.create({
        amount: orderTotal,
        currency,
        receipt: `order_${wooOrder.data.id}`
      });

      // Add Razorpay order ID to WooCommerce order notes
      await WooCommerce.post(`orders/${wooOrder.data.id}/notes`, {
        note: `Razorpay Order ID: ${razorpayOrder.id}`,
        customer_note: false
      });

      res.status(200).json({
        razorpayOrder,
        wooCommerceOrder: wooOrder.data
      });
    }
  } catch (error) {
    console.error('Order creation failed:', error);
    res.status(500).json({
      message: 'Failed to create order',
      error: error.message
    });
  }
};

export const handlePaymentPayload = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    if (!signature) {
      console.error('Webhook Error: Missing Razorpay signature');
      return res.status(400).json({ message: 'Missing Razorpay signature' });
    }

    if (!validateWebhookSignature(req.body, signature)) {
      console.error('Webhook Error: Invalid signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // Log the webhook payload for debugging
    console.log('Received Razorpay webhook:', JSON.stringify(req.body, null, 2));

    const event = req.body.event;
    if (!event) {
      console.error('Webhook Error: Missing event type');
      return res.status(400).json({ message: 'Missing event type' });
    }

    // Handle different webhook events
    switch (event) {
      case 'payment.captured': {
        const { payload } = req.body;
        const payment = payload.payment?.entity;
        
        if (!payment) {
          throw new Error('Invalid payment data in webhook');
        }

        // Get WooCommerce order ID from receipt
        const razorpayOrderId = payment.order_id;
        const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
        const wooOrderId = razorpayOrder.receipt.replace('order_', '');

        // Update WooCommerce order status
        await updateWooCommerceOrder(wooOrderId, 'processing');

        // Add payment details to order notes
        await WooCommerce.post(`orders/${wooOrderId}/notes`, {
          note: `Payment completed - Razorpay Payment ID: ${payment.id}\nAmount: ${payment.amount/100} ${payment.currency}`,
          customer_note: false
        });

        break;
      }
      
      case 'payment.failed': {
        const { payload } = req.body;
        const payment = payload.payment?.entity;
        
        if (!payment) {
          throw new Error('Invalid payment data in webhook');
        }

        const razorpayOrderId = payment.order_id;
        const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
        const wooOrderId = razorpayOrder.receipt.replace('order_', '');

        await updateWooCommerceOrder(wooOrderId, 'failed');
        
        // Add failure details to order notes
        await WooCommerce.post(`orders/${wooOrderId}/notes`, {
          note: `Payment failed - Razorpay Payment ID: ${payment.id}\nError: ${payment.error_description || 'No error description'}`,
          customer_note: false
        });

        break;
      }

      case 'order.paid': {
        const { payload } = req.body;
        const order = payload.order?.entity;
        
        if (!order) {
          throw new Error('Invalid order data in webhook');
        }

        const wooOrderId = order.receipt.replace('order_', '');

        // Update WooCommerce order status and payment details
        await updateWooCommerceOrder(wooOrderId, 'processing');

        // Add payment confirmation details to order notes
        await WooCommerce.post(`orders/${wooOrderId}/notes`, {
          note: `Order paid - Razorpay Order ID: ${order.id}\nAmount: ${order.amount/100} ${order.currency}`,
          customer_note: false
        });

        break;
      }

      case 'refund.processed': {
        const { payload } = req.body;
        const refund = payload.refund?.entity;
        
        if (!refund) {
          throw new Error('Invalid refund data in webhook');
        }

        const razorpayOrderId = refund.order_id;
        const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
        const wooOrderId = razorpayOrder.receipt.replace('order_', '');

        await updateWooCommerceOrder(wooOrderId, 'refunded');
        
        // Add refund details to order notes
        await WooCommerce.post(`orders/${wooOrderId}/notes`, {
          note: `Refund processed - Razorpay Refund ID: ${refund.id}\nAmount: ${refund.amount/100} ${refund.currency}`,
          customer_note: false
        });

        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event}`);
        return res.status(200).json({ message: 'Unhandled webhook event' });
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      message: 'Failed to process webhook',
      error: error.message
    });
  }
};
