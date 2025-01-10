import express from 'express';
import { updateBillingAddress, updateShippingAddress, getCart, addItemToCart, removeProductFromCart, updateCartItem } from '../controllers/customerController.js';
import verifyJWT from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:customerId/billing', verifyJWT, updateBillingAddress);
router.put('/:customerId/shipping', verifyJWT, updateShippingAddress);
router.get('/cart', verifyJWT, getCart);
router.post('/cart/add-item', verifyJWT, addItemToCart);
router.post('/cart/item/:cart_item_key', verifyJWT, updateCartItem);
router.delete('/cart/remove/:cart_item_key', verifyJWT, removeProductFromCart);

export default router;
