import fetch from 'node-fetch';
import dotenv from 'dotenv';
import WooCommerce from '../config/woocommerce.js';

dotenv.config();

const WP_BASE_URL = process.env.WP_BASE_URL;
const JWT_LOGIN_ENDPOINT = process.env.JWT_LOGIN_ENDPOINT;
const USERS_ENDPOINT = process.env.USERS_ENDPOINT;
const ME_ENDPOINT = process.env.ME_ENDPOINT;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export const login = async (req, res) => {
  const { username, password } = req.body;
console.log(username,password)
  try {
    const response = await fetch(JWT_LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();
    if (data.code === '[jwt_auth] uv_authentication_failed') {
      return res.status(403).json({ message: 'Please verify your Email' });
    }
    res.json(data);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const me = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const response = await fetch(ME_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Failed to fetch user data' });
    }

    const userData = await response.json();

    const customerId = userData.id;
    const wooCommerceResponse = await WooCommerce.get(`customers/${customerId}`);

    const customerData = wooCommerceResponse.data;

    res.json({ ...userData, customerData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};

export const register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const adminResponse = await fetch(JWT_LOGIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
    });

    if (!adminResponse.ok) {
      const errorData = await adminResponse.json();
      return res.status(401).json({ message: `Failed to create user ${errorData.message} `,  });
    }
    const adminData = await adminResponse.json();
    const adminToken = adminData.token;

    // 2. Create a new user with the admin token
    const userResponse = await fetch(USERS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ username, password, email }),
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      return res.status(userResponse.status).json({ message: `Failed to create user ${errorData.message} `,  });
    }

    // Respond with success message, indicating email verification is needed
    res.status(201).json({ message: 'Your account has been created. Please verify your email.' });

    // Check if customer already exists in WooCommerce
    try {
      const existingCustomers = await WooCommerce.get('customers', { email: email });
      if (existingCustomers.data.length > 0) {
        console.log('WooCommerce customer already exists');
      } else {
        // Create customer in WooCommerce
        const wooCommerceResponse = await WooCommerce.post('customers', {
          email: email,
          username: username,
          password: password
        });
        console.log('WooCommerce customer created successfully', wooCommerceResponse.data);
        const wooCommerceCustomerId = wooCommerceResponse.data.id;
        console.log('WooCommerce Customer ID:', wooCommerceCustomerId);
      }
    } catch (error) {
      console.error('Error creating WooCommerce customer:', error.response ? error.response.data : error.message);
      
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
}
