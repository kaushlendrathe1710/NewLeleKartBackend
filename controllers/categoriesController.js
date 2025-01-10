import WooCommerce from '../config/woocommerce.js';

export const getCategories = async (req, res) => {
  const queryParams = { ...req.query, parent: 0 };
  const pageNumber = parseInt(queryParams.page || 1);

  try {
    const categoriesResponse = await WooCommerce.get('products/categories', queryParams);
    const totalCategoriesResponse = await WooCommerce.get('products/categories', { ...queryParams, per_page: 1 });
    const totalCategoryCount = parseInt(totalCategoriesResponse.headers['x-wp-total'], 10);

    res.send({
      data: categoriesResponse.data,
      pageNumber,
      totalCategoryCount,
    });
  } catch (error) {
    res.status(error.response.status).send(error.response.data);
  }
};

export const getCategoryById = (req, res) => {
  const { id } = req.params;
  WooCommerce.get(`products/categories/${id}`)
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};

export const getSubcategories = (req, res) => {
  const { parentId } = req.params;
  WooCommerce.get('products/categories', { parent: parentId })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};
