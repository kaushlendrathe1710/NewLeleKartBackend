import WooCommerce from '../config/woocommerce.js';

const variationsCache = {};
const CACHE_EXPIRATION_TIME = 300; // 300 seconds

export const getProductVariations = (req, res) => {
  const { productId } = req.params;
  const cacheKey = `products/${productId}/variations`;

  if (variationsCache[cacheKey] && Date.now() - variationsCache[cacheKey].timestamp < CACHE_EXPIRATION_TIME * 1000) {
    return res.send(variationsCache[cacheKey]);
  }

  WooCommerce.get(cacheKey)
    .then((response) => {
      const totalVariations = parseInt(response.headers['x-wp-total'], 10);
      variationsCache[cacheKey] = {
        data: response.data,
        totalVariations: totalVariations,
        timestamp: Date.now(),
      };
      res.send(variationsCache);
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};

export const getProductVariationById = (req, res) => {
  const { productId, variationId } = req.params;
  const cacheKey = `products/${productId}/variations/${variationId}`;

  if (variationsCache[cacheKey] && Date.now() - variationsCache[cacheKey].timestamp < CACHE_EXPIRATION_TIME * 1000) {
    return res.send(variationsCache[cacheKey].data);
  }

  WooCommerce.get(cacheKey)
    .then((response) => {
      variationsCache[cacheKey] = {
        data: response.data,
        timestamp: Date.now(),
      };
      res.send(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};

export const clearProductVariationsCache = (req, res) => {
  Object.keys(variationsCache).forEach(key => {
    if (key.startsWith('products') && key.endsWith('variations')) {
      delete variationsCache[key];
    }
  });
  res.send({ message: 'Product variations cache cleared' });
};
