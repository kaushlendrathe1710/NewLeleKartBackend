import WooCommerce from '../config/woocommerce.js';

export const getProductVariations = (req, res) => {
  const { productId } = req.params;
  WooCommerce.get(`products/${productId}/variations`)
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};

export const getProductVariationById = (req, res) => {
  const { productId, variationId } = req.params;
  WooCommerce.get(`products/${productId}/variations/${variationId}`)
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};
