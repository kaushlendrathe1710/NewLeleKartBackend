import WooCommerce from '../config/woocommerce.js';

export const getCategories = (req, res) => {
  const queryParams = req.query;
  WooCommerce.get('products/categories', queryParams)
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};

export const getCategoryById = (req, res) => {
  const { id } = req.params;
  WooCommerce.get(`products/categories/${id}`)
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};
