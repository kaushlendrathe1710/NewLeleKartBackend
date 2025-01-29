import WooCommerce from '../config/woocommerce.js';

export const createRefundRequest = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const customerId = req.user.id;

  try {
    // First verify that the order belongs to this customer
    const orderResponse = await WooCommerce.get(`orders/${orderId}`);
    const order = orderResponse.data;

    

    // Check if order status is completed or delivered
    if (order.status !== 'completed' && order.status !== 'delivered') {
      return res.status(400).json({ 
        message: 'Refund can only be initiated for completed or delivered orders' 
      });
    }

    // Create refund for full order amount
    const refundData = {
      amount: order.total,
      reason: reason,
      api_refund: false // Set to false as this is just a request
    };

    const response = await WooCommerce.post(`orders/${orderId}/refunds`, refundData);
    
    // Update order note to indicate this is a refund request
    await WooCommerce.post(`orders/${orderId}/notes`, {
      note: `Full Order Refund Request:\nReason: ${reason}\nAmount: ${order.total}\nStatus: Pending approval`,
      customer_note: true
    });

    res.status(201).json({
      message: 'Refund request created successfully',
      refund: response.data
    });
  } catch (error) {
    console.error('Error creating refund request:', error);
    res.status(500).json({ message: 'Failed to create refund request' });
  }
};


export const updateBillingAddress = async (req, res) => {
  const { customerId } = req.params;
  const { billing } = req.body;

  try {
    const response = await WooCommerce.put(`customers/${customerId}`, {
      billing: billing,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error updating billing address:', error);
    res.status(500).json({ message: 'Failed to update billing address' });
  }
};

export const createCustomerOrder = async (req, res) => {
  try {
    const { line_items, payment_method } = req.body;
    const customerId = req.user.id;

    // Fetch customer data to get billing and shipping addresses
    const customer = await WooCommerce.get(`customers/${customerId}`);

    let orderData = {
      customer_id: customerId,
      billing: customer.data.billing,
      shipping: customer.data.shipping,
      line_items: line_items,
      payment_method: payment_method,
    };

    if (payment_method === 'cod') {
      orderData = { ...orderData, status: 'processing' };
    } else {
      orderData = { ...orderData, set_paid: false };
    }

    const response = await WooCommerce.post('orders', orderData);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const response = await WooCommerce.get('orders', { customer: customerId });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;
  try {
    const order = await WooCommerce.get(`orders/${orderId}`);
    const response = await WooCommerce.put(`orders/${orderId}`, {
      status: 'cancelled',
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
};

export const updateShippingAddress = async (req, res) => {
  console.log('hit this')
  const { customerId } = req.params;
  const { shipping } = req.body;

  try {
    const response = await WooCommerce.put(`customers/${customerId}`, {
      shipping: shipping,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error updating shipping address:', error);
    res.status(500).json({ message: 'Failed to update shipping address' });
  }
};

export const getCart = async (req, res) => {
  const customerToken = req.headers.authorization?.split(" ")[1];
  const api_url = "https://lelekart.com/wp-json/cocart/v2/cart";

  if (!customerToken) {
    return res.status(401).send({ message: "No token provided" });
  }

  try {
    const response = await fetch(api_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
    });

    if (response.ok) {
      const cartData = await response.json();
      res.json(cartData);
    } else {
      console.log(
        `Error fetching cart: ${response.status} - ${await response.text()}`
      );
      res.status(response.status).send({ message: "Failed to fetch cart" });
    }
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    res.status(500).send({ message: "Failed to fetch cart" });
  }
};

export const removeProductFromCart = async (req, res) => {
  const customerToken = req.headers.authorization?.split(" ")[1];
  const { cart_item_key } = req.params;
  const api_url = `https://lelekart.com/wp-json/cocart/v2/cart/item/${cart_item_key}`;

  if (!customerToken) {
    return res.status(401).send({ message: "No token provided" });
  }

  try {
    const response = await fetch(api_url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
    });

    if (response.ok) {
      const cartData = await response.json();
      res.status(200).json(cartData);
    } else {
      const errorData = await response.json();
      console.error("Error removing item from cart:", errorData);
      res.status(response.status).send(errorData);
    }
  } catch (error) {
    console.error("Failed to remove item from cart:", error);
    res.status(500).send({ message: "Failed to remove item from cart" });
  }
};

export const updateCartItem = async (req, res) => {
  const customerToken = req.headers.authorization?.split(" ")[1];
  const { cart_item_key } = req.params;
  const { quantity } = req.body;
  const api_url = `https://lelekart.com/wp-json/cocart/v2/cart/item/${cart_item_key}`;

  if (!customerToken) {
    return res.status(401).send({ message: "No token provided" });
  }

  if (!quantity) {
    return res.status(400).send({ message: "Quantity is required" });
  }

  try {
    const response = await fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ quantity: String(quantity) }),
    });

    if (response.ok) {
      const cartData = await response.json();
      res.status(200).json(cartData);
    } else {
      const errorData = await response.json();
      console.error("Error updating item in cart:", errorData);
      res.status(response.status).send(errorData);
    }
  } catch (error) {
    console.error("Failed to update item in cart:", error);
    res.status(500).send({ message: "Failed to update item in cart" });
  }
};

export const addItemToCart = async (req, res) => {
  console.log('hit this')
  const customerToken = req.headers.authorization?.split(" ")[1];
  const products = req.body;
  console.log(products);
  const api_url = "https://lelekart.com/wp-json/cocart/v2/cart/add-item";

  if (!customerToken) {
    return res.status(401).send({ message: "No token provided" });
  }

  if (!Array.isArray(products) || products.length === 0) {
    return res
      .status(400)
      .send({ message: "An array of products is required" });
  }

  const results = [];

  for (const product of products) {
    const { product_id, quantity } = product;

    if (!product_id || !quantity) {
      results.push({
        status: "error",
        message: "Product ID and quantity are required",
      });
      continue;
    }

    try {
      const response = await fetch(api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          id: String(product_id),
          quantity: String(quantity),
        }),
      });

      if (response.ok) {
        const cartData = await response.json();
        results.push({ status: "success", data: cartData });
      } else {
        const errorData = await response.json();
        console.error(`Error adding item ${product_id} to cart:`, errorData);
        results.push({ status: "error", message: errorData });
      }
    } catch (error) {
      console.error(`Failed to add item ${product_id} to cart:`, error);
      results.push({ status: "error", message: "Failed to add item to cart" });
    }
  }

  res.status(200).json(results);
};

export const getPaymentMethods = async (req, res) => {
  try {
    const response = await WooCommerce.get('payment_gateways');
    const paymentMethods = response.data
      .filter(gateway => gateway.enabled)
      .map(gateway => ({
        id: gateway.id,
        name: gateway.name,
        description: gateway.description,
        enabled: gateway.enabled
      }));
    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Failed to fetch payment methods' });
  }
};
