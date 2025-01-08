import WooCommerce from '../config/woocommerce.js';

export const getProducts = (req, res) => {
  const queryParams = req.query;

  WooCommerce.get('products', queryParams)
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};

export const getProductById = (req, res) => {
  const { id } = req.params;
  WooCommerce.get(`products/${id}`)
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};
