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

        // Check if code is numeric (ID) or text (coupon code)
        if (/^\d+$/.test(code)) {
            // If numeric, fetch directly by ID
            const response = await WooCommerce.get(`coupons/${code}`);
            res.status(200).json(response.data);
        } else {
            // If text, search by coupon code
            const response = await WooCommerce.get('coupons', {
                code: code
            });
            
            if (response.data && response.data.length > 0) {
                res.status(200).json(response.data[0]);
            } else {
                res.status(404).json({
                    error: "Coupon not found",
                    details: `No coupon found with code: ${code}`
                });
            }
        }
    } catch (error) {
        res.status(404).json({
            error: "Coupon not found",
            details: error.message
        });
    }
};

export {
    getAllCoupons,
    getCouponByCode
};
