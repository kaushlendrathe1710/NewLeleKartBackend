import express from 'express';
import { getProducts, getProductById } from '../controllers/productsController.js';
import { getProductVariations, getProductVariationById } from '../controllers/productVariationsController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:productId/variations', getProductVariations);
router.get('/:productId/variations/:variationId', getProductVariationById);

export default router;
