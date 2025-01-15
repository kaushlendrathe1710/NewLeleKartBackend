import WooCommerce from '../config/woocommerce.js';

const categoriesCache = {};
const CACHE_EXPIRATION_TIME = 300; // 300 seconds

export const getCategories = async (req, res) => {
    const cacheKey = 'parent-product-categories';
    try {
        const response = await WooCommerce.get('products/categories', { per_page: 100 });
        const parentCategories = response.data.filter(category => category.parent === 0);
        categoriesCache[cacheKey] = { data: parentCategories, timestamp: Date.now() };
        res.json(parentCategories);
    } catch (error) {
        console.error("Error fetching parent product categories:", error);
        res.status(500).json({ error: 'Failed to fetch parent product categories' });
    }
};

export const getCategoryById = async (req, res) => {
    const { id } = req.params;
    const cacheKey = `products/categories/${id}`;
    try {
        const response = await WooCommerce.get(cacheKey);
        if (response.status === 200) {
            categoriesCache[cacheKey] = {
                data: response.data,
                timestamp: Date.now(),
            };
            res.json(response.data);
        } else if (response.status === 404) {
            res.status(404).json({ error: 'Product category not found' });
        } else {
            console.error(`Error fetching product category with ID ${id}:`, response);
            res.status(500).json({ error: 'Failed to fetch product category' });
        }
    } catch (error) {
        console.error(`Error fetching product category with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch product category' });
    }
};

export const getSubcategories = async (req, res) => {
    const { parentId } = req.params;
    const cacheKey = `products/categories?parent=${parentId}`;
    try {
        const response = await WooCommerce.get(cacheKey);
        const totalSubcategories = parseInt(response.headers['x-wp-total'], 10);
        categoriesCache[cacheKey] = {
            data: response.data,
            totalSubcategories: totalSubcategories,
            timestamp: Date.now(),
        };
        res.json(categoriesCache[cacheKey]);
    } catch (error) {
        console.error("Error fetching subcategories for parent ID:", parentId, error);
        res.status(500).json({ error: 'Failed to fetch subcategories' });
    }
};

export const clearCategoriesCache = (req, res) => {
    Object.keys(categoriesCache).forEach(key => {
        if (key.startsWith('products/categories')) {
            delete categoriesCache[key];
        }
    });
};
