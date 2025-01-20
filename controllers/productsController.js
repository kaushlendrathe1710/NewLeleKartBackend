import WooCommerce from '../config/woocommerce.js';


const productsCache = {};
const CACHE_EXPIRATION_TIME = 300; // seconds

function isCacheExpired(cacheEntry) {
  if (!cacheEntry || !cacheEntry.timestamp) {
    return true;
  }
  return (Date.now() - cacheEntry.timestamp) / 1000 > CACHE_EXPIRATION_TIME;
}

export const getProducts = (req, res) => {
  const queryParams = req.query;
  const cacheKey = 'products-' + JSON.stringify(queryParams);

  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }

  const pageNumber = parseInt(queryParams.page) || 1;

  WooCommerce.get('products', queryParams)
    .then((response) => {
      const totalProducts = parseInt(response.headers['x-wp-total'], 10);
      const responseData = {
        data: response.data,
        pageNumber: pageNumber,
        totalProducts: totalProducts,
        timestamp: Date.now(),
      };
      productsCache[cacheKey] = responseData;
      res.send(responseData);
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};


export const getWhatsNew = async (req, res) => {
  const cacheKey = 'whatsNew-' + JSON.stringify(req.query);
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }
  try {
    const params = {
      ...req.query,
      orderby: 'date',
      order: 'desc'
    };
    const response = await WooCommerce.get('products', params);
    const totalProducts = parseInt(response.headers['x-wp-total'], 10);
    const responseData = {
      data: response.data,
      pageNumber: 1,
      totalProducts: totalProducts,
      timestamp: Date.now(),
    };
    productsCache[cacheKey] = responseData;
    res.send(responseData);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getClearance = async (req, res) => {
  const cacheKey = 'clearance-' + JSON.stringify(req.query);
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }
  try {
    const tagsResponse = await WooCommerce.get('products/tags', { slug: 'clearance' });
    if (tagsResponse.data.length > 0) {
      const tagId = tagsResponse.data[0].id;
      const params = {
        ...req.query,
        tag: tagId
      };
      const response = await WooCommerce.get('products', params);
      const totalProducts = parseInt(response.headers['x-wp-total'], 10);
      const responseData = {
        data: response.data,
        pageNumber: 1,
        totalProducts: totalProducts,
        timestamp: Date.now(),
      };
      productsCache[cacheKey] = responseData;
      res.send(responseData);
    } else {
      res.status(404).send({ message: 'Clearance tag not found' });
    }
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getExploreProducts = async (req, res) => {
  const cacheKey = 'exploreProducts-' + JSON.stringify(req.query);
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }
  try {
    const response = await WooCommerce.get('products', req.query);
    // Function to shuffle array (Fisher-Yates shuffle)
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    shuffleArray(response.data);
    const totalProducts = parseInt(response.headers['x-wp-total'], 10);
    const responseData = {
      data: response.data,
      pageNumber: 1,
      totalProducts: totalProducts,
      timestamp: Date.now(),
    };
    productsCache[cacheKey] = responseData;
    res.send(responseData);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getHotDeals = async (req, res) => {
  const cacheKey = 'hotDeals-' + JSON.stringify(req.query);
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }
  try {
    const params = {
      ...req.query,
      on_sale: true
    };
    const response = await WooCommerce.get('products', params);
    const totalProducts = parseInt(response.headers['x-wp-total'], 10);
    const responseData = {
      data: response.data,
      pageNumber: 1,
      totalProducts: totalProducts,
      timestamp: Date.now(),
    };
    productsCache[cacheKey] = responseData;
    res.send(responseData);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getAllTags = async (req, res) => {
  const cacheKey = 'allTags';
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }
  try {
    const response = await WooCommerce.get('products/tags');
    productsCache[cacheKey] = { data: response.data, timestamp: Date.now() };
    res.send(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `product-${id}`;
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }

  try {
    const productResponse = await WooCommerce.get(`products/${id}`);
    const product = productResponse.data;

    let variations = [];
    if (product.variations.length > 0) {
      const variationsResponse = await WooCommerce.get(
        `products/${id}/variations`
      );
      variations = variationsResponse.data;
    }

    const responseData = { product, variations, timestamp: Date.now() };
    productsCache[cacheKey] = responseData;
    res.send(responseData);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || error.message);
  }
};

export const clearProductCache = (req, res) => {
  Object.keys(productsCache).forEach(key => delete productsCache[key]);
};
