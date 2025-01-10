import WooCommerce from '../config/woocommerce.js';

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

export const updateShippingAddress = async (req, res) => {
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
  const customerToken = req.headers.authorization?.split(' ')[1];
  const api_url = 'https://lelekart.com/wp-json/cocart/v2/cart';

  if (!customerToken) {
    return res.status(401).send({ message: 'No token provided' });
  }

  try {
    const response = await fetch(api_url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
    });

    if (response.ok) {
      const cartData = await response.json();
      res.json(cartData);
    } else {
      console.log(`Error fetching cart: ${response.status} - ${await response.text()}`);
      res.status(response.status).send({ message: 'Failed to fetch cart' });
    }
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    res.status(500).send({ message: 'Failed to fetch cart' });
  }
};

export const removeProductFromCart = async (req, res) => {
  const customerToken = req.headers.authorization?.split(' ')[1];
  const { cart_item_key } = req.params;
  const api_url = `https://lelekart.com/wp-json/cocart/v2/cart/item/${cart_item_key}`;

  if (!customerToken) {
    return res.status(401).send({ message: 'No token provided' });
  }

  try {
    const response = await fetch(api_url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
    });

    if (response.ok) {
      const cartData = await response.json();
      res.status(200).json(cartData);
    } else {
      const errorData = await response.json();
      console.error('Error removing item from cart:', errorData);
      res.status(response.status).send(errorData);
    }
  } catch (error) {
    console.error('Failed to remove item from cart:', error);
    res.status(500).send({ message: 'Failed to remove item from cart' });
  }
};

export const updateCartItem = async (req, res) => {
  const customerToken = req.headers.authorization?.split(' ')[1];
  const { cart_item_key } = req.params;
  const { quantity } = req.body;
  const api_url = `https://lelekart.com/wp-json/cocart/v2/cart/item/${cart_item_key}`;

  if (!customerToken) {
    return res.status(401).send({ message: 'No token provided' });
  }

  if (!quantity) {
    return res.status(400).send({ message: 'Quantity is required' });
  }

  try {
    const response = await fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ quantity: String(quantity) }),
    });

    if (response.ok) {
      const cartData = await response.json();
      res.status(200).json(cartData);
    } else {
      const errorData = await response.json();
      console.error('Error updating item in cart:', errorData);
      res.status(response.status).send(errorData);
    }
  } catch (error) {
    console.error('Failed to update item in cart:', error);
    res.status(500).send({ message: 'Failed to update item in cart' });
  }
};

export const addItemToCart = async (req, res) => {
  const customerToken = req.headers.authorization?.split(' ')[1];
  const products = req.body;
  const api_url = 'https://lelekart.com/wp-json/cocart/v2/cart/add-item';

  if (!customerToken) {
    return res.status(401).send({ message: 'No token provided' });
  }

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).send({ message: 'An array of products is required' });
  }

  const results = [];

  for (const product of products) {
    const { product_id, quantity } = product;

    if (!product_id || !quantity) {
      results.push({ status: 'error', message: 'Product ID and quantity are required' });
      continue;
    }

    try {
      const response = await fetch(api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          id: String(product_id),
          quantity: String(quantity),
        }),
      });

      if (response.ok) {
        const cartData = await response.json();
        results.push({ status: 'success', data: cartData });
      } else {
        const errorData = await response.json();
        console.error(`Error adding item ${product_id} to cart:`, errorData);
        results.push({ status: 'error', message: errorData });
      }
    } catch (error) {
      console.error(`Failed to add item ${product_id} to cart:`, error);
      results.push({ status: 'error', message: 'Failed to add item to cart' });
    }
  }

  res.status(200).json(results);
};
