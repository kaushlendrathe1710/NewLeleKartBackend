import express from 'express';
import productRoutes from './routes/productsRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import WooCommerce from './config/woocommerce.js';

const app = express();
const PORT = 3000;

app.use('/products', productRoutes);
app.use('/categories', categoriesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
