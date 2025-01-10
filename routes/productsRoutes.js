import express from 'express';
import { getProducts, getProductById, getWhatsNew, getClearance, getAllTags, getHotDeals, getExploreProducts } from '../controllers/productsController.js';
import { getProductVariations, getProductVariationById } from '../controllers/productVariationsController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/tags', getAllTags);
router.get('/hot-deals', getHotDeals);
router.get('/whats-new', getWhatsNew);
router.get('/clearance', getClearance);
router.get('/explore', getExploreProducts);
router.get('/:id', getProductById);
router.get('/:productId/variations', getProductVariations);
router.get('/:productId/variations/:variationId', getProductVariationById);

export default router;
