import express from 'express';
import { getAllCoupons, getCouponById } from '../controllers/couponController.js';

const router = express.Router();

// Route to get all coupons
router.get('/', getAllCoupons);

// Route to get a specific coupon by ID
router.get('/:id', getCouponById);

export default router;
