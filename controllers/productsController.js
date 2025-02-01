import WooCommerce from '../config/woocommerce.js';

const productsCache = {};
const CACHE_EXPIRATION_TIME = 300; // seconds

function isCacheExpired(cacheEntry) {
  if (!cacheEntry || !cacheEntry.timestamp) {
    return true;
  }
  return (Date.now() - cacheEntry.timestamp) / 1000 > CACHE_EXPIRATION_TIME;
}

export const getProducts = async (req, res) => {
  const queryParams = req.query;
  const cacheKey = 'products-' + JSON.stringify(queryParams);

  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }

  const pageNumber = parseInt(queryParams.page) || 1;

  try {
    // Fetch products
    const productsResponse = await WooCommerce.get('products', queryParams);
    
    // Fetch all attributes with their terms
    const attributesResponse = await WooCommerce.get('products/attributes');
    const attributes = attributesResponse.data;
    
    // Fetch terms for each attribute
    const attributesWithTerms = await Promise.all(attributes.map(async (attribute) => {
      const termsResponse = await WooCommerce.get(`products/attributes/${attribute.id}/terms`);
      return {
        id: attribute.id,
        name: attribute.name.toLowerCase(),
        terms: termsResponse.data.map(term => ({
          id: term.id,
          name: term.name
        }))
      };
    }));

    const totalProducts = parseInt(productsResponse.headers['x-wp-total'], 10);
    const responseData = {
      data: productsResponse.data,
      pageNumber: pageNumber,
      totalProducts: totalProducts,
      filter: attributesWithTerms,
      timestamp: Date.now(),
    };
    
    productsCache[cacheKey] = responseData;
    res.send(responseData);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
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
    // Fetch products
    const response = await WooCommerce.get('products', params);
    
    // Fetch all attributes with their terms
    const attributesResponse = await WooCommerce.get('products/attributes');
    const attributes = attributesResponse.data;
    
    // Fetch terms for each attribute
    const attributesWithTerms = await Promise.all(attributes.map(async (attribute) => {
      const termsResponse = await WooCommerce.get(`products/attributes/${attribute.id}/terms`);
      return {
        id: attribute.id,
        name: attribute.name.toLowerCase(),
        terms: termsResponse.data.map(term => ({
          id: term.id,
          name: term.name
        }))
      };
    }));

    const totalProducts = parseInt(response.headers['x-wp-total'], 10);
    const responseData = {
      data: response.data,
      pageNumber: parseInt(req.query.page) || 1,
      totalProducts: totalProducts,
      filter: attributesWithTerms,
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
      // Fetch products
      const response = await WooCommerce.get('products', params);
      
      // Fetch all attributes with their terms
      const attributesResponse = await WooCommerce.get('products/attributes');
      const attributes = attributesResponse.data;
      
      // Fetch terms for each attribute
      const attributesWithTerms = await Promise.all(attributes.map(async (attribute) => {
        const termsResponse = await WooCommerce.get(`products/attributes/${attribute.id}/terms`);
        return {
          id: attribute.id,
          name: attribute.name.toLowerCase(),
          terms: termsResponse.data.map(term => ({
            id: term.id,
            name: term.name
          }))
        };
      }));

      const totalProducts = parseInt(response.headers['x-wp-total'], 10);
      const responseData = {
        data: response.data,
        pageNumber: parseInt(req.query.page) || 1,
        totalProducts: totalProducts,
        filter: attributesWithTerms,
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
    // Fetch products
    const response = await WooCommerce.get('products', req.query);
    
    // Fetch all attributes with their terms
    const attributesResponse = await WooCommerce.get('products/attributes');
    const attributes = attributesResponse.data;
    
    // Fetch terms for each attribute
    const attributesWithTerms = await Promise.all(attributes.map(async (attribute) => {
      const termsResponse = await WooCommerce.get(`products/attributes/${attribute.id}/terms`);
      return {
        id: attribute.id,
        name: attribute.name.toLowerCase(),
        terms: termsResponse.data.map(term => ({
          id: term.id,
          name: term.name
        }))
      };
    }));

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
      pageNumber: parseInt(req.query.page) || 1,
      totalProducts: totalProducts,
      filter: attributesWithTerms,
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
    // Fetch products
    const response = await WooCommerce.get('products', params);
    
    // Fetch all attributes with their terms
    const attributesResponse = await WooCommerce.get('products/attributes');
    const attributes = attributesResponse.data;
    
    // Fetch terms for each attribute
    const attributesWithTerms = await Promise.all(attributes.map(async (attribute) => {
      const termsResponse = await WooCommerce.get(`products/attributes/${attribute.id}/terms`);
      return {
        id: attribute.id,
        name: attribute.name.toLowerCase(),
        terms: termsResponse.data.map(term => ({
          id: term.id,
          name: term.name
        }))
      };
    }));

    const totalProducts = parseInt(response.headers['x-wp-total'], 10);
    const responseData = {
      data: response.data,
      pageNumber: parseInt(req.query.page) || 1,
      totalProducts: totalProducts,
      filter: attributesWithTerms,
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

export async function getAllProductsFromCache(forceRefresh = false) {
  const cacheKey = 'all-products';
  
  if (!forceRefresh && productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return productsCache[cacheKey];
  }

  // Get first page to get total number of products
  const firstPageResponse = await WooCommerce.get('products', { per_page: 100, page: 1 });
  const totalProducts = parseInt(firstPageResponse.headers['x-wp-total']);
  const totalPages = parseInt(firstPageResponse.headers['x-wp-totalpages']);

  // Fetch all pages
  const allProducts = [...firstPageResponse.data];
  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
  
  await Promise.all(
    remainingPages.map(async (page) => {
      const response = await WooCommerce.get('products', { per_page: 100, page });
      allProducts.push(...response.data);
    })
  );

  const responseData = {
    data: allProducts,
    totalProducts: totalProducts,
    timestamp: Date.now()
  };

  productsCache[cacheKey] = responseData;
  return responseData;
}

export const filterProductsByAttribute = async (req, res) => {
  const { attributeId, attributeTerm, page = 1, order } = req.query;
  const per_page = 10;
  const currentPage = parseInt(page);

  if (!attributeId || !attributeTerm) {
    return res.status(400).send('Missing attributeId or attributeTerm');
  }

  const cacheKey = `filter-${attributeId}-${attributeTerm}-${order || 'default'}`;
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }

  try {
    const allProductsCache = await getAllProductsFromCache();
    const allProducts = allProductsCache.data;
    const totalOriginalProducts = allProductsCache.totalProducts;

    const filteredProducts = allProducts.filter(product => {
      if (!product.attributes) return false;
      return product.attributes.some(attr => {
        if (parseInt(attr.id) === parseInt(attributeId)) {
          if (Array.isArray(attr.options)) {
            return attr.options.some(opt => opt.toLowerCase() === attributeTerm.toLowerCase());
          }
          if (typeof attr.options === 'string') {
            return attr.options.toLowerCase().includes(attributeTerm.toLowerCase());
          }
        }
        return false;
      });
    });

    // Paginate the filtered results
    const startIndex = (currentPage - 1) * per_page;
    const endIndex = startIndex + per_page;
    // Sort products by price if order parameter is provided
    if (order) {
      filteredProducts.sort((a, b) => {
        // Handle regular price vs sale price
        const priceA = parseFloat(a.sale_price) || parseFloat(a.regular_price) || parseFloat(a.price) || 0;
        const priceB = parseFloat(b.sale_price) || parseFloat(b.regular_price) || parseFloat(b.price) || 0;
        return order === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const responseData = {
      data: paginatedProducts,
      totalProducts: filteredProducts.length,
      totalOriginalProducts: totalOriginalProducts,
      currentPage: currentPage,
      per_page: per_page,
      total_pages: Math.ceil(filteredProducts.length / per_page),
      timestamp: Date.now()
    };
    
    productsCache[cacheKey] = responseData;
    res.send(responseData);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};
