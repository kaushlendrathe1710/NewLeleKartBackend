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

export const addItemToCart = async (req, res) => {
  const customerToken = req.headers.authorization?.split(' ')[1];
  const { product_id, quantity } = req.body;
  const api_url = 'https://lelekart.com/wp-json/cocart/v2/cart/add-item';

  if (!customerToken) {
    return res.status(401).send({ message: 'No token provided' });
  }

  if (!product_id || !quantity) {
    return res.status(400).send({ message: 'Product ID and quantity are required' });
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
      res.status(200).json(cartData);
    } else {
      const errorData = await response.json();
      console.error('Error adding item to cart:', errorData);
      res.status(response.status).send(errorData);
    }
  } catch (error) {
    console.error('Failed to add item to cart:', error);
    res.status(500).send({ message: 'Failed to add item to cart' });
  }
};
