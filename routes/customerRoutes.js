import express from 'express';
import { updateBillingAddress, updateShippingAddress, getCart, addItemToCart } from '../controllers/customerController.js';
import verifyJWT from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:customerId/billing', verifyJWT, updateBillingAddress);
router.put('/:customerId/shipping', verifyJWT, updateShippingAddress);
router.get('/cart', verifyJWT, getCart);
router.post('/cart/add-item', verifyJWT, addItemToCart);

export default router;
