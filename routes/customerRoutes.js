import express from 'express';
import { updateBillingAddress, updateShippingAddress, getCart, addItemToCart, removeProductFromCart, updateCartItem, getPaymentMethods, createCustomerOrder, getOrders, cancelOrder } from '../controllers/customerController.js';
import verifyJWT from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:customerId/billing', verifyJWT, updateBillingAddress);
router.put('/:customerId/shipping', verifyJWT, updateShippingAddress);
router.get('/cart', verifyJWT, getCart);
router.post('/cart/add-item', verifyJWT, addItemToCart);
router.post('/cart/item/:cart_item_key', verifyJWT, updateCartItem);
router.get('/payment-methods', getPaymentMethods);
router.get('/orders', verifyJWT, getOrders);
router.put('/orders/:orderId/cancel', verifyJWT, cancelOrder);
router.post('/orders/create', verifyJWT, createCustomerOrder);
router.delete('/cart/remove/:cart_item_key', verifyJWT, removeProductFromCart);

export default router;
