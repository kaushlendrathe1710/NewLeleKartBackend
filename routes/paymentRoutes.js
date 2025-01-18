import express from 'express';
import { handlePaymentPayload } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/', handlePaymentPayload);

export default router;
