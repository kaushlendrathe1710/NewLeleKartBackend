import WooCommerce from '../config/woocommerce.js';


export const getProducts = (req, res) => {
  const queryParams = req.query;
  const pageNumber = parseInt(queryParams.page) || 1;

  WooCommerce.get('products', queryParams)
    .then((totalResponse) => {
      const totalProducts = parseInt(totalResponse.headers['x-wp-total'], 10);

      WooCommerce.get('products', queryParams)
        .then((response) => {
          res.send({
            products: response.data,
            pageNumber: pageNumber,
            totalProducts: totalProducts,
          });
        })
        .catch((error) => {
          res.status(error.response.status).send(error.response.data);
        });
    })
    .catch((error) => {
      res.status(error.response.status).send(error.response.data);
    });
};


export const getWhatsNew = async (req, res) => {
  try {
    const response = await WooCommerce.get('products', { orderby: 'date', order: 'desc' });
    res.send(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getClearance = async (req, res) => {
  try {
    const tagsResponse = await WooCommerce.get('products/tags', { slug: 'clearance' });
    if (tagsResponse.data.length > 0) {
      const tagId = tagsResponse.data[0].id;
      const response = await WooCommerce.get('products', { tag: tagId });
      res.send(response.data);
    } else {
      res.status(404).send({ message: 'Clearance tag not found' });
    }
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getExploreProducts = async (req, res) => {
  try {
    const response = await WooCommerce.get('products', req.query);
    // Function to shuffle array (Fisher-Yates shuffle)
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    shuffleArray(response.data);
    res.send(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getHotDeals = async (req, res) => {
  try {
    const response = await WooCommerce.get('products', { on_sale: true });
    res.send(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getAllTags = async (req, res) => {
  try {
    const response = await WooCommerce.get('products/tags');
    res.send(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const productResponse = await WooCommerce.get(`products/${id}`);
    const product = productResponse.data;

    let variations = [];
    if (product.variations.length > 0) {
      const variationsResponse = await WooCommerce.get(
        `products/${id}/variations`
      );
      variations = variationsResponse.data;
    }

    res.send({ product, variations });
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || error.message);
  }
};
