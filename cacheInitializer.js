import WooCommerce from './config/woocommerce.js';

const productsCache = {};

async function fetchAllCategories() {
  console.log('Fetching all categories...');
  try {
    const response = await WooCommerce.get('products/categories', { per_page: 100 });
    const categories = response.data;
    console.log(`Successfully fetched ${categories.length} categories.`);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function initializeCache() {
  try {
    console.log('Initializing cache...');
    const categories = await fetchAllCategories();

    console.log('Fetching and caching categories...');
    await fetchAndCache('/categories');
    for (const category of categories) {
      await fetchAndCache(`/categories/${category.id}`);
      await fetchAndCache(`/categories/${category.id}/subcategories`);
    }

    console.log('Fetching and caching products by category...');
    for (const category of categories) {
      await fetchAndCache(`/products?category=${category.id}`);
    }

    console.log('Fetching all product IDs...');
    const perPage = 100; // You can adjust this number
    const initialResponse = await WooCommerce.get('products', { per_page: perPage, page: 1 });
    const totalProducts = parseInt(initialResponse.headers['x-wp-total'], 10);
    const totalPages = Math.ceil(totalProducts / perPage);
    console.log(`Total products found: ${totalProducts} in ${totalPages} pages.`);

    let allProducts = [];
    for (let page = 1; page <= totalPages; page++) {
      const response = await WooCommerce.get('products', { per_page: perPage, page: page });
      allProducts = allProducts.concat(response.data);
      console.log(`Fetched ${allProducts.length} products so far...`);
    }

    const productIds = allProducts.map(product => product.id);
    console.log(`Total product IDs fetched: ${productIds.length}`);

    console.log('Fetching and caching individual products and variations...');
    for (const productId of productIds) {
      await fetchAndCache(`/products/${productId}`);
      await fetchAndCacheProductVariations(productId);
    }

    console.log('Initializing cache for other product routes...');
    await fetchAndCache('/products/whats-new');
    await fetchAndCache('/products/clearance');
    await fetchAndCache('/products/explore');
    await fetchAndCache('/products/hot-deals');
    await fetchAndCache('/products/tags');

    console.log('Cache initialization complete.');
  } catch (error) {
    console.error('Error initializing cache:', error);
  }
}

async function fetchAndCacheProductVariations(productId) {
  console.log(`Fetching variations for product ID ${productId}...`);
  try {
    const perPage = 100; // You can adjust this number
    const initialResponse = await WooCommerce.get(`products/${productId}/variations`, { per_page: perPage, page: 1 });
    const totalVariations = parseInt(initialResponse.headers['x-wp-total'], 10);
    const totalPages = Math.ceil(totalVariations / perPage);
    console.log(`Total variations found for product ${productId}: ${totalVariations} in ${totalPages} pages.`);

    let allVariations = [];
    for (let page = 1; page <= totalPages; page++) {
      const response = await WooCommerce.get(`products/${productId}/variations`, { per_page: perPage, page: page });
      allVariations = allVariations.concat(response.data);
      console.log(`Fetched ${allVariations.length} variations for product ${productId} so far...`);
    }

    console.log(`Successfully fetched ${allVariations.length} variations for product ID ${productId}`);
    // Store variations in the productsCache
    if (!productsCache[`/products/${productId}`]) {
      productsCache[`/products/${productId}`] = {};
    }
    productsCache[`/products/${productId}`].variations = allVariations;
    // Optionally fetch and log individual variations (assuming IDs are available)
    for (const variation of allVariations) {
      await fetchAndCache(`/products/${productId}/variations/${variation.id}`);
    }
  } catch (error) {
    console.error(`Error fetching variations for product ID ${productId}`, error);
  }
}

async function fetchAndCache(endpoint) {
  console.log(`Fetching and caching ${endpoint}...`);
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`);
    if (!response.ok) {
      console.error(`Error fetching ${endpoint}: ${response.status} ${response.statusText}`);
      return;
    }
    const data = await response.json();
    console.log(`Successfully fetched ${endpoint}`);
    productsCache[endpoint] = data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}`, error);
  }
}
