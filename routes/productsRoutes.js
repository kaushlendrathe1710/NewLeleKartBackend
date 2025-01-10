import express from 'express';
import { getProducts, getProductById, getFlashDeals, getWhatsNew, getClearance, getAllTags, getHotDeals } from '../controllers/productsController.js';
import { getProductVariations, getProductVariationById } from '../controllers/productVariationsController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/tags', getAllTags);
router.get('/flash-deals', getFlashDeals);
router.get('/hot-deals', getHotDeals);
router.get('/whats-new', getWhatsNew);
router.get('/clearance', getClearance);
router.get('/:id', getProductById);
router.get('/:productId/variations', getProductVariations);
router.get('/:productId/variations/:variationId', getProductVariationById);

export default router;
