import express from 'express';
import { getAllCoupons, getCouponByCode } from '../controllers/couponController.js';

const router = express.Router();

// Route to get all coupons
router.get('/', getAllCoupons);

// Route to get coupon by code or ID
router.get('/:code', getCouponByCode);

export default router;
