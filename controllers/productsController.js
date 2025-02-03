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
  let { page = 1, order, attributeId, attributeTerm, category, search } = req.query;
  
  // Convert attributeId and attributeTerm to arrays if they exist
  const attributeIds = attributeId ? (Array.isArray(attributeId) ? attributeId : [attributeId]) : [];
  const attributeTerms = attributeTerm ? (Array.isArray(attributeTerm) ? attributeTerm : [attributeTerm]) : [];
  const per_page = 10;
  const currentPage = parseInt(page);
  
  const cacheKey = `products-${attributeIds.join(',') || ''}-${attributeTerms.join(',') || ''}-${category || ''}-${search || ''}-${order || 'default'}-${page}`;
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }

  try {
    const allProductsCache = await getAllProductsFromCache();
    let products = allProductsCache.data;
    const totalOriginalProducts = allProductsCache.totalProducts;

    // Search filter if provided
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        (product.description && product.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by category if provided
    if (category) {
      products = products.filter(product => 
        product.categories && 
        product.categories.some(cat => cat.id === parseInt(category))
      );
    }

    // Apply attribute filters if provided
    if (attributeIds.length > 0 && attributeTerms.length > 0) {
      // Create separate product arrays for each attribute filter
      const filteredArrays = attributeIds.map((attrId, index) => {
        const term = attributeTerms[index];
        if (!attrId || !term) return [];
        
        return products.filter(product => {
          if (!product.attributes) return false;
          return product.attributes.some(attr => {
            if (parseInt(attr.id) === parseInt(attrId)) {
              if (Array.isArray(attr.options)) {
                return attr.options.some(opt => opt.toLowerCase() === term.toLowerCase());
              }
              if (typeof attr.options === 'string') {
                return attr.options.toLowerCase().includes(term.toLowerCase());
              }
            }
            return false;
          });
        });
      });

      // Combine all filtered arrays
      products = filteredArrays.flat();
    }

    // Sort products by price if order parameter is provided
    if (order) {
      products.sort((a, b) => {
        const priceA = parseFloat(a.sale_price) || parseFloat(a.regular_price) || parseFloat(a.price) || 0;
        const priceB = parseFloat(b.sale_price) || parseFloat(b.regular_price) || parseFloat(b.price) || 0;
        return order === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    // Paginate results
    const startIndex = (currentPage - 1) * per_page;
    const endIndex = startIndex + per_page;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Fetch all attributes with their terms for filter UI
    const attributesResponse = await WooCommerce.get('products/attributes');
    const attributes = attributesResponse.data;
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

    const responseData = {
      data: paginatedProducts,
      totalProducts: products.length,
      totalOriginalProducts: totalOriginalProducts,
      currentPage: currentPage,
      per_page: per_page,
      total_pages: Math.ceil(products.length / per_page),
      filter: attributesWithTerms,
      timestamp: Date.now()
    };
    
    productsCache[cacheKey] = responseData;
    res.send(responseData);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getWhatsNew = async (req, res) => {
  let { page = 1, order, attributeId, attributeTerm, category, search } = req.query;
  
  // Convert attributeId and attributeTerm to arrays if they exist
  const attributeIds = attributeId ? (Array.isArray(attributeId) ? attributeId : [attributeId]) : [];
  const attributeTerms = attributeTerm ? (Array.isArray(attributeTerm) ? attributeTerm : [attributeTerm]) : [];
  const per_page = 10;
  const currentPage = parseInt(page);
  
  const cacheKey = `whatsNew-${attributeIds.join(',') || ''}-${attributeTerms.join(',') || ''}-${category || ''}-${search || ''}-${order || 'default'}-${page}`;
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }

  try {
    const allProductsCache = await getAllProductsFromCache();
    let products = allProductsCache.data;
    const totalOriginalProducts = allProductsCache.totalProducts;

    // Sort by date descending first (newest first)
    products.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

    // Search filter if provided
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        (product.description && product.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by category if provided
    if (category) {
      products = products.filter(product => 
        product.categories && 
        product.categories.some(cat => cat.id === parseInt(category))
      );
    }

    // Apply attribute filters if provided
    if (attributeIds.length > 0 && attributeTerms.length > 0) {
      // Create separate product arrays for each attribute filter
      const filteredArrays = attributeIds.map((attrId, index) => {
        const term = attributeTerms[index];
        if (!attrId || !term) return [];
        
        return products.filter(product => {
          if (!product.attributes) return false;
          return product.attributes.some(attr => {
            if (parseInt(attr.id) === parseInt(attrId)) {
              if (Array.isArray(attr.options)) {
                return attr.options.some(opt => opt.toLowerCase() === term.toLowerCase());
              }
              if (typeof attr.options === 'string') {
                return attr.options.toLowerCase().includes(term.toLowerCase());
              }
            }
            return false;
          });
        });
      });

      // Combine all filtered arrays
      products = filteredArrays.flat();
    }

    // Sort products by price if order parameter is provided
    if (order) {
      products.sort((a, b) => {
        const priceA = parseFloat(a.sale_price) || parseFloat(a.regular_price) || parseFloat(a.price) || 0;
        const priceB = parseFloat(b.sale_price) || parseFloat(b.regular_price) || parseFloat(b.price) || 0;
        return order === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    // Paginate results
    const startIndex = (currentPage - 1) * per_page;
    const endIndex = startIndex + per_page;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Fetch all attributes with their terms for filter UI
    const attributesResponse = await WooCommerce.get('products/attributes');
    const attributes = attributesResponse.data;
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

    const responseData = {
      data: paginatedProducts,
      totalProducts: products.length,
      totalOriginalProducts: totalOriginalProducts,
      currentPage: currentPage,
      per_page: per_page,
      total_pages: Math.ceil(products.length / per_page),
      filter: attributesWithTerms,
      timestamp: Date.now()
    };
    
    productsCache[cacheKey] = responseData;
    res.send(responseData);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getClearance = async (req, res) => {
  let { page = 1, order, attributeId, attributeTerm, category, search } = req.query;
  
  // Convert attributeId and attributeTerm to arrays if they exist
  const attributeIds = attributeId ? (Array.isArray(attributeId) ? attributeId : [attributeId]) : [];
  const attributeTerms = attributeTerm ? (Array.isArray(attributeTerm) ? attributeTerm : [attributeTerm]) : [];
  const per_page = 10;
  const currentPage = parseInt(page);
  
  const cacheKey = `clearance-${attributeIds.join(',') || ''}-${attributeTerms.join(',') || ''}-${category || ''}-${search || ''}-${order || 'default'}-${page}`;
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }

  try {
    // First get the clearance tag ID
    const tagsResponse = await WooCommerce.get('products/tags', { slug: 'clearance' });
    if (tagsResponse.data.length === 0) {
      return res.status(404).send({ message: 'Clearance tag not found' });
    }
    const tagId = tagsResponse.data[0].id;

    const allProductsCache = await getAllProductsFromCache();
    let products = allProductsCache.data;
    const totalOriginalProducts = allProductsCache.totalProducts;

    // Filter for clearance products
    products = products.filter(product => product.tags && product.tags.some(tag => tag.id === tagId));

    // Search filter if provided
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        (product.description && product.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by category if provided
    if (category) {
      products = products.filter(product => 
        product.categories && 
        product.categories.some(cat => cat.id === parseInt(category))
      );
    }

    // Apply attribute filters if provided
    if (attributeIds.length > 0 && attributeTerms.length > 0) {
      // Create separate product arrays for each attribute filter
      const filteredArrays = attributeIds.map((attrId, index) => {
        const term = attributeTerms[index];
        if (!attrId || !term) return [];
        
        return products.filter(product => {
          if (!product.attributes) return false;
          return product.attributes.some(attr => {
            if (parseInt(attr.id) === parseInt(attrId)) {
              if (Array.isArray(attr.options)) {
                return attr.options.some(opt => opt.toLowerCase() === term.toLowerCase());
              }
              if (typeof attr.options === 'string') {
                return attr.options.toLowerCase().includes(term.toLowerCase());
              }
            }
            return false;
          });
        });
      });

      // Combine all filtered arrays
      products = filteredArrays.flat();
    }

    // Sort products by price if order parameter is provided
    if (order) {
      products.sort((a, b) => {
        const priceA = parseFloat(a.sale_price) || parseFloat(a.regular_price) || parseFloat(a.price) || 0;
        const priceB = parseFloat(b.sale_price) || parseFloat(b.regular_price) || parseFloat(b.price) || 0;
        return order === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    // Paginate results
    const startIndex = (currentPage - 1) * per_page;
    const endIndex = startIndex + per_page;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Fetch all attributes with their terms for filter UI
    const attributesResponse = await WooCommerce.get('products/attributes');
    const attributes = attributesResponse.data;
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

    const responseData = {
      data: paginatedProducts,
      totalProducts: products.length,
      totalOriginalProducts: totalOriginalProducts,
      currentPage: currentPage,
      per_page: per_page,
      total_pages: Math.ceil(products.length / per_page),
      filter: attributesWithTerms,
      timestamp: Date.now()
    };
    
    productsCache[cacheKey] = responseData;
    res.send(responseData);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getExploreProducts = async (req, res) => {
  let { page = 1, order, attributeId, attributeTerm, category, search } = req.query;
  
  // Convert attributeId and attributeTerm to arrays if they exist
  const attributeIds = attributeId ? (Array.isArray(attributeId) ? attributeId : [attributeId]) : [];
  const attributeTerms = attributeTerm ? (Array.isArray(attributeTerm) ? attributeTerm : [attributeTerm]) : [];
  const per_page = 10;
  const currentPage = parseInt(page);
  
  const cacheKey = `explore-${attributeIds.join(',') || ''}-${attributeTerms.join(',') || ''}-${category || ''}-${search || ''}-${order || 'default'}-${page}`;
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }

  try {
    const allProductsCache = await getAllProductsFromCache();
    let products = [...allProductsCache.data]; // Create a copy for shuffling
    const totalOriginalProducts = allProductsCache.totalProducts;

    // Search filter if provided
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        (product.description && product.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by category if provided
    if (category) {
      products = products.filter(product => 
        product.categories && 
        product.categories.some(cat => cat.id === parseInt(category))
      );
    }

    // Apply attribute filters if provided
    if (attributeIds.length > 0 && attributeTerms.length > 0) {
      // Create separate product arrays for each attribute filter
      const filteredArrays = attributeIds.map((attrId, index) => {
        const term = attributeTerms[index];
        if (!attrId || !term) return [];
        
        return products.filter(product => {
          if (!product.attributes) return false;
          return product.attributes.some(attr => {
            if (parseInt(attr.id) === parseInt(attrId)) {
              if (Array.isArray(attr.options)) {
                return attr.options.some(opt => opt.toLowerCase() === term.toLowerCase());
              }
              if (typeof attr.options === 'string') {
                return attr.options.toLowerCase().includes(term.toLowerCase());
              }
            }
            return false;
          });
        });
      });

      // Combine all filtered arrays
      products = filteredArrays.flat();
    }

    // Sort products by price if order parameter is provided
    if (order) {
      products.sort((a, b) => {
        const priceA = parseFloat(a.sale_price) || parseFloat(a.regular_price) || parseFloat(a.price) || 0;
        const priceB = parseFloat(b.sale_price) || parseFloat(b.regular_price) || parseFloat(b.price) || 0;
        return order === 'asc' ? priceA - priceB : priceB - priceA;
      });
    } else {
      // Shuffle array (Fisher-Yates shuffle) if no order specified
      for (let i = products.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [products[i], products[j]] = [products[j], products[i]];
      }
    }

    // Paginate results
    const startIndex = (currentPage - 1) * per_page;
    const endIndex = startIndex + per_page;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Fetch all attributes with their terms for filter UI
    const attributesResponse = await WooCommerce.get('products/attributes');
    const attributes = attributesResponse.data;
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

    const responseData = {
      data: paginatedProducts,
      totalProducts: products.length,
      totalOriginalProducts: totalOriginalProducts,
      currentPage: currentPage,
      per_page: per_page,
      total_pages: Math.ceil(products.length / per_page),
      filter: attributesWithTerms,
      timestamp: Date.now()
    };
    
    productsCache[cacheKey] = responseData;
    res.send(responseData);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getHotDeals = async (req, res) => {
  let { page = 1, order, attributeId, attributeTerm, category, search } = req.query;
  
  // Convert attributeId and attributeTerm to arrays if they exist
  const attributeIds = attributeId ? (Array.isArray(attributeId) ? attributeId : [attributeId]) : [];
  const attributeTerms = attributeTerm ? (Array.isArray(attributeTerm) ? attributeTerm : [attributeTerm]) : [];
  const per_page = 10;
  const currentPage = parseInt(page);
  
  const cacheKey = `hotDeals-${attributeIds.join(',') || ''}-${attributeTerms.join(',') || ''}-${category || ''}-${search || ''}-${order || 'default'}-${page}`;
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }

  try {
    const allProductsCache = await getAllProductsFromCache();
    let products = allProductsCache.data;
    const totalOriginalProducts = allProductsCache.totalProducts;

    // Filter for products on sale
    products = products.filter(product => {
      const regularPrice = parseFloat(product.regular_price) || 0;
      const salePrice = parseFloat(product.sale_price) || 0;
      return salePrice > 0 && salePrice < regularPrice;
    });

    // Search filter if provided
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        (product.description && product.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by category if provided
    if (category) {
      products = products.filter(product => 
        product.categories && 
        product.categories.some(cat => cat.id === parseInt(category))
      );
    }

    // Apply attribute filters if provided
    if (attributeIds.length > 0 && attributeTerms.length > 0) {
      // Create separate product arrays for each attribute filter
      const filteredArrays = attributeIds.map((attrId, index) => {
        const term = attributeTerms[index];
        if (!attrId || !term) return [];
        
        return products.filter(product => {
          if (!product.attributes) return false;
          return product.attributes.some(attr => {
            if (parseInt(attr.id) === parseInt(attrId)) {
              if (Array.isArray(attr.options)) {
                return attr.options.some(opt => opt.toLowerCase() === term.toLowerCase());
              }
              if (typeof attr.options === 'string') {
                return attr.options.toLowerCase().includes(term.toLowerCase());
              }
            }
            return false;
          });
        });
      });

      // Combine all filtered arrays
      products = filteredArrays.flat();
    }

    // Sort products by price if order parameter is provided
    if (order) {
      products.sort((a, b) => {
        const priceA = parseFloat(a.sale_price) || parseFloat(a.regular_price) || parseFloat(a.price) || 0;
        const priceB = parseFloat(b.sale_price) || parseFloat(b.regular_price) || parseFloat(b.price) || 0;
        return order === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    // Paginate results
    const startIndex = (currentPage - 1) * per_page;
    const endIndex = startIndex + per_page;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Fetch all attributes with their terms for filter UI
    const attributesResponse = await WooCommerce.get('products/attributes');
    const attributes = attributesResponse.data;
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

    const responseData = {
      data: paginatedProducts,
      totalProducts: products.length,
      totalOriginalProducts: totalOriginalProducts,
      currentPage: currentPage,
      per_page: per_page,
      total_pages: Math.ceil(products.length / per_page),
      filter: attributesWithTerms,
      timestamp: Date.now()
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
  let { page = 1, order, attributeId, attributeTerm } = req.query;
  const per_page = 10;
  const currentPage = parseInt(page);
  
  // Convert attributeId and attributeTerm to arrays if they exist
  const attributeIds = attributeId ? (Array.isArray(attributeId) ? attributeId : [attributeId]) : [];
  const attributeTerms = attributeTerm ? (Array.isArray(attributeTerm) ? attributeTerm : [attributeTerm]) : [];

  if (!attributeIds.length || !attributeTerms.length) {
    return res.status(400).send('Missing attributeId or attributeTerm');
  }

  const cacheKey = `filter-${attributeIds.join(',') || ''}-${attributeTerms.join(',') || ''}-${order || 'default'}-${page}`;
  if (productsCache[cacheKey] && !isCacheExpired(productsCache[cacheKey])) {
    return res.send(productsCache[cacheKey]);
  }

  try {
    const allProductsCache = await getAllProductsFromCache();
    const allProducts = allProductsCache.data;
    const totalOriginalProducts = allProductsCache.totalProducts;

    // Create separate product arrays for each attribute filter
    const filteredArrays = attributeIds.map((attrId, index) => {
      const term = attributeTerms[index];
      if (!attrId || !term) return [];
      
      return allProducts.filter(product => {
        if (!product.attributes) return false;
        return product.attributes.some(attr => {
          if (parseInt(attr.id) === parseInt(attrId)) {
            if (Array.isArray(attr.options)) {
              return attr.options.some(opt => opt.toLowerCase() === term.toLowerCase());
            }
            if (typeof attr.options === 'string') {
              return attr.options.toLowerCase().includes(term.toLowerCase());
            }
          }
          return false;
        });
      });
    });

    // Combine all filtered arrays
    const filteredProducts = filteredArrays.flat();

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
