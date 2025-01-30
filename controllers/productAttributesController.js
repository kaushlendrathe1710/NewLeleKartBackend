import WooCommerce from '../config/woocommerce.js';

const attributesCache = {};
const CACHE_EXPIRATION_TIME = 300; // 300 seconds

export const getAttributes = async (req, res) => {
    const cacheKey = 'products/attributes';
    if (attributesCache[cacheKey] && Date.now() - attributesCache[cacheKey].timestamp < CACHE_EXPIRATION_TIME * 1000) {
        return res.json(attributesCache[cacheKey]);
    }
    try {
        const response = await WooCommerce.get(cacheKey);
        const totalAttributes = parseInt(response.headers['x-wp-total'], 10);
        attributesCache[cacheKey] = {
            data: response.data,
            totalAttributes: totalAttributes,
            timestamp: Date.now(),
        };
        res.json(attributesCache[cacheKey]);
    } catch (error) {
        console.error("Error fetching product attributes:", error);
        res.status(500).json({ error: 'Failed to fetch product attributes' });
    }
};

export const getAttributeById = async (req, res) => {
    const { id } = req.params;
    const cacheKey = `products/attributes/${id}`;
    if (attributesCache[cacheKey] && Date.now() - attributesCache[cacheKey].timestamp < CACHE_EXPIRATION_TIME * 1000) {
        return res.json(attributesCache[cacheKey].data);
    }
    try {
        const response = await WooCommerce.get(cacheKey);
        if (response.status === 200) {
            attributesCache[cacheKey] = {
                data: response.data,
                timestamp: Date.now(),
            };
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

export const getAllAttributesWithTerms = async (req, res) => {
    const cacheKey = 'attributes_with_terms';
    if (attributesCache[cacheKey] && Date.now() - attributesCache[cacheKey].timestamp < CACHE_EXPIRATION_TIME * 1000) {
        return res.json(attributesCache[cacheKey].data);
    }

    try {
        // First get all attributes
        const attributesResponse = await WooCommerce.get('products/attributes');
        const attributes = attributesResponse.data;

        // For each attribute, fetch its terms
        const attributesWithTerms = await Promise.all(attributes.map(async (attribute) => {
            const termsResponse = await WooCommerce.get(`products/attributes/${attribute.id}/terms`);
            return {
                ...attribute,
                terms: termsResponse.data
            };
        }));

        // Cache the results
        attributesCache[cacheKey] = {
            data: attributesWithTerms,
            timestamp: Date.now()
        };

        res.json(attributesWithTerms);
    } catch (error) {
        console.error("Error fetching attributes with terms:", error);
        res.status(500).json({ error: 'Failed to fetch attributes with terms' });
    }
};

export const clearProductAttributesCache = (req, res) => {
    Object.keys(attributesCache).forEach(key => {
        if (key.startsWith('products') && key.includes('attributes')) {
            delete attributesCache[key];
        }
    });
};
