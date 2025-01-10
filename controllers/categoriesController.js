import WooCommerce from '../config/woocommerce.js';

export const getCategories = (req, res) => {
  const queryParams = { ...req.query, parent: 0 };
  const pageNumber = parseInt(queryParams.page || 1);
  WooCommerce.get('products/categories', queryParams)
    .then((response) => {
      res.send({
        data: response.data,
        pageNumber,
      });
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

export const getSubcategories = (req, res) => {
  const { parentId } = req.params;
  WooCommerce.get('products/categories', { parent: parentId })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};
