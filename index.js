import express from 'express';
import cors from 'cors'; // Import the cors package
import productRoutes from './routes/productsRoutes.js';
import productAttributesRoutes from './routes/productAttributesRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import WooCommerce from './config/woocommerce.js';
import customerRoutes from './routes/customerRoutes.js';
import clearCacheRoutes from './routes/clearCacheRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import refundRoutes from './routes/refundRoutes.js';

const app = express();
const PORT = 3000;

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
