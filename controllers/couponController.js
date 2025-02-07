import WooCommerce from '../config/woocommerce.js';

const getAllCoupons = async (req, res) => {
    try {
        const coupons = await WooCommerce.get('coupons');
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch coupons",
            details: error.message
        });
    }
};

const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await WooCommerce.get(`coupons/${id}`);
        res.status(200).json(coupon);
    } catch (error) {
        res.status(404).json({
            error: "Coupon not found",
            details: error.message
        });
    }
};

export {
    getAllCoupons,
    getCouponById
};
