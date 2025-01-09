import WooCommerce from '../config/woocommerce.js';

export const getAttributes = async (req, res) => {
    try {
        const response = await WooCommerce.get('products/attributes');
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching product attributes:", error);
        res.status(500).json({ error: 'Failed to fetch product attributes' });
    }
};

export const getAttributeById = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await WooCommerce.get(`products/attributes/${id}`);
        if (response.status === 200) {
            res.json(response.data);
        } else if (response.status === 404) {
            res.status(404).json({ error: 'Product attribute not found' });
        } else {
            console.error(`Error fetching product attribute with ID ${id}:`, response);
            res.status(500).json({ error: 'Failed to fetch product attribute' });
        }
    } catch (error) {
        console.error(`Error fetching product attribute with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch product attribute' });
    }
};
