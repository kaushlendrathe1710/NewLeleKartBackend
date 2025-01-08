import express from 'express';
import productRoutes from './routes/productsRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import WooCommerce from './config/woocommerce.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/products', productRoutes);
app.use('/categories', categoriesRoutes);
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
