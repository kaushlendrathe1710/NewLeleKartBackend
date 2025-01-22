import express from 'express';
import { handlePaymentPayload, createOrder } from '../controllers/paymentController.js';
import verifyJWT from '../middleware/authMiddleware.js';

const router = express.Router();

// Create new order with Razorpay and WooCommerce
router.post('/orders/create', verifyJWT, createOrder);

// Razorpay webhook endpoint
router.post('/webhook/razorpay', handlePaymentPayload);

export default router;
