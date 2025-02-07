import WooCommerce from '../config/woocommerce.js';

const getAllCoupons = async (req, res) => {
    try {
        const response = await WooCommerce.get('coupons');
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch coupons",
            details: error.message
        });
    }
};

const getCouponByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const response = await WooCommerce.get('coupons', {
            code: code
        });
        
        if (response.data && response.data.length > 0) {
            res.status(200).json({
                id: response.data[0].id,
                code: response.data[0].code
            });
        } else {
            res.status(404).json({
                error: "Coupon not found",
                details: `No coupon found with code: ${code}`
            });
        }
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch coupon",
            details: error.message
        });
    }
};

const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await WooCommerce.get(`coupons/${id}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({
            error: "Coupon not found",
            details: error.message
        });
    }
};

export {
    getAllCoupons,
    getCouponById,
    getCouponByCode
};
