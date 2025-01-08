import pkg from '@woocommerce/woocommerce-rest-api';
const WooCommerceRestApi = pkg.default;

const WooCommerce = new WooCommerceRestApi({
  url: "https://lelechicks.com",
  consumerKey: "ck_50836d6e06adbfa3f5be997b2d5cac199a0d9b85",
  consumerSecret: "cs_95b5eb7c1a6af2571e59ce822452d0894b5bd21d",
  version: 'wc/v3'
});

export default WooCommerce;
