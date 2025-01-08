import express from 'express';
import productRoutes from './routes/products.js';
import WooCommerce from './config/woocommerce.js';

const app = express();
const PORT = 3000;

app.use('/', productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
