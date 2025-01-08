import WooCommerce from '../config/woocommerce.js';

export const getProducts = (req, res) => {
  WooCommerce.get('products')
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.send(error.response.data);
    });
};
