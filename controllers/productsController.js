import WooCommerce from '../config/woocommerce.js';

export const getProducts = (req, res) => {
  const queryParams = req.query;
  const pageNumber = parseInt(queryParams.page) || 1;

  WooCommerce.get('products', queryParams)
    .then((totalResponse) => {
      const totalProducts = parseInt(totalResponse.headers['x-wp-total'], 10);

      WooCommerce.get('products', queryParams)
        .then((response) => {
          res.send({
            products: response.data,
            pageNumber: pageNumber,
            totalProducts: totalProducts,
          });
        })
        .catch((error) => {
          res.status(error.response.status).send(error.response.data);
        });
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch product details
    const productResponse = await WooCommerce.get(`products/${id}`);
    const product = productResponse.data;

    // Fetch product variations (if any)
    let variations = [];
    if (product.variations.length > 0) {
      const variationsResponse = await WooCommerce.get(
        `products/${id}/variations`
      );
      variations = variationsResponse.data;
    }

    // Send combined response
    res.send({ product, variations });
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || error.message);
  }
};
