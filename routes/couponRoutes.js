import express from 'express';
import { getAllCoupons, getCouponById, getCouponByCode } from '../controllers/couponController.js';

const router = express.Router();

// Route to get all coupons
router.get('/', getAllCoupons);

// Route to get coupon by code
router.get('/code/:code', getCouponByCode);

// Route to get coupon by ID
router.get('/:id', getCouponById);

export default router;
