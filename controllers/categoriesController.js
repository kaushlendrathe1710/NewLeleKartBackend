import WooCommerce from '../config/woocommerce.js';

export const getCategoryFilters = async (req, res) => {
    const { id } = req.params;
    const cacheKey = `category-filters/${id}`;
    
    if (categoriesCache[cacheKey] && Date.now() - categoriesCache[cacheKey].timestamp < CACHE_EXPIRATION_TIME * 1000) {
        return res.json(categoriesCache[cacheKey].data);
    }

    try {
        // Fetch products from the specific category
        const response = await WooCommerce.get('products', {
            category: id,
            per_page: 100,
        });

        if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid response from WooCommerce API');
        }

        // Extract and process attributes from all products
        const filtersMap = new Map();

        response.data.forEach(product => {
            if (product.attributes && Array.isArray(product.attributes)) {
                product.attributes.forEach(attr => {
                    const key = `${attr.id}|${attr.name}`;
                    if (!filtersMap.has(key)) {
                        filtersMap.set(key, new Set());
                    }
                    // Handle both single values and arrays of values
                    if (Array.isArray(attr.options)) {
                        attr.options.forEach(option => {
                            filtersMap.get(key).add(option);
                        });
                    } else if (attr.option) {
                        filtersMap.get(key).add(attr.option);
                    }
                });
            }
        });

        // Convert Map to array of filter objects
        const filters = Array.from(filtersMap.entries()).map(([key, values]) => {
            const [id, name] = key.split('|');
            return {
                id: parseInt(id),
                name,
                terms: Array.from(values)
            };
        });

        // Cache the results
        categoriesCache[cacheKey] = {
            data: filters,
            timestamp: Date.now()
        };

        res.json(filters);
    } catch (error) {
        console.error(`Error fetching filters for category ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch category filters' });
    }
};

const categoriesCache = {};
const CACHE_EXPIRATION_TIME = 300; // 300 seconds

export const getCategories = async (req, res) => {
    const cacheKey = 'parent-product-categories';
    if (categoriesCache[cacheKey] && Date.now() - categoriesCache[cacheKey].timestamp < CACHE_EXPIRATION_TIME * 1000) {
        return res.json(categoriesCache[cacheKey].data);
    }
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
    if (categoriesCache[cacheKey] && Date.now() - categoriesCache[cacheKey].timestamp < CACHE_EXPIRATION_TIME * 1000) {
        return res.json(categoriesCache[cacheKey].data);
    }
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
    if (categoriesCache[cacheKey] && Date.now() - categoriesCache[cacheKey].timestamp < CACHE_EXPIRATION_TIME * 1000) {
        return res.json(categoriesCache[cacheKey]);
    }
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
