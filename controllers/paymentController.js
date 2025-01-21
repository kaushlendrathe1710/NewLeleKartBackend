import crypto from 'crypto';
import dotenv from 'dotenv';
import WooCommerce from '../config/woocommerce.js';

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

export const handlePaymentPayload = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    if (!signature) {
      return res.status(400).json({ message: 'Missing Razorpay signature' });
    }

    if (!validateWebhookSignature(req.body, signature)) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const { payload } = req.body;
    const { payment } = payload;

    if (!payment || !payment.entity) {
      return res.status(400).json({ message: 'Invalid payload structure' });
    }

    const { order_id, status } = payment.entity;

    // Map Razorpay status to WooCommerce status
    let woocommerceStatus;
    switch (status) {
      case 'captured':
        woocommerceStatus = 'completed';
        break;
      case 'failed':
        woocommerceStatus = 'failed';
        break;
      case 'refunded':
        woocommerceStatus = 'refunded';
        break;
      default:
        woocommerceStatus = 'pending';
    }

    await updateWooCommerceOrder(order_id, woocommerceStatus);

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Failed to process webhook' });
  }
};
