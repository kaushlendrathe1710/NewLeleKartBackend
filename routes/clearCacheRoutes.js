import express from 'express';
import { clearProductCache } from '../controllers/productsController.js';
import { clearProductVariationsCache } from '../controllers/productVariationsController.js';
import { clearProductAttributesCache } from '../controllers/productAttributesController.js';
import { clearCategoriesCache } from '../controllers/categoriesController.js';

const router = express.Router();

router.get('/clear-cache', (req, res) => {
  clearProductCache(req, res);
  clearProductVariationsCache(req, res);
  clearProductAttributesCache(req, res);
  clearCategoriesCache(req, res);
  res.send({ message: 'All caches cleared' });
});

export default router;
