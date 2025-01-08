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
