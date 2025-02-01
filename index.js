import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productsRoutes.js';
import productAttributesRoutes from './routes/productAttributesRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import clearCacheRoutes from './routes/clearCacheRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import refundRoutes from './routes/refundRoutes.js';
import { getAllProductsFromCache } from './controllers/productsController.js';
import WooCommerce from './config/woocommerce.js';

const app = express();
const PORT = 3000;

// Cache refresh configuration
const CACHE_REFRESH_INTERVAL = 300 * 1000; // 300 seconds in milliseconds

async function refreshAllProductsCache() {
  try {
    console.log('Refreshing all products cache...');
    await getAllProductsFromCache(true); // force refresh
    console.log('All products cache refreshed successfully');
  } catch (error) {
    console.error('Error refreshing all products cache:', error);
  }
}

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Routes
app.use('/products', productRoutes);
app.use('/attributes', productAttributesRoutes);
app.use('/categories', categoriesRoutes);
app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/payment', paymentRoutes);
app.use('/cache', clearCacheRoutes);
app.use('/banners', bannerRoutes);
app.use('/refunds', refundRoutes);

// Initialize server with cache
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Initial cache load
  console.log('Initializing products cache...');
  try {
    await getAllProductsFromCache(true);
    console.log('Initial products cache loaded successfully');
    
    // Start the refresh interval
    setInterval(refreshAllProductsCache, CACHE_REFRESH_INTERVAL);
  } catch (error) {
    console.error('Error initializing products cache:', error);
  }
});
