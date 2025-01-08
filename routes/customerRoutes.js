import express from 'express';
import { updateBillingAddress, updateShippingAddress } from '../controllers/customerController.js';
import verifyJWT from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:customerId/billing', verifyJWT, updateBillingAddress);
router.put('/:customerId/shipping', verifyJWT, updateShippingAddress);

export default router;
