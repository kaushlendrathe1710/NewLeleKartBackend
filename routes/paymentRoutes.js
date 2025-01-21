import express from 'express';
import { handlePaymentPayload } from '../controllers/paymentController.js';

const router = express.Router();

// Razorpay webhook endpoint
router.post('/webhook/razorpay', handlePaymentPayload);

export default router;
