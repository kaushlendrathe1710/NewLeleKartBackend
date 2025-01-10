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
    res.json(data);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const FORGOT_PASSWORD_ENDPOINT = `${WP_BASE_URL}/wp-json/wp/v2/users/lostpassword`;

  try {
    const response = await fetch(FORGOT_PASSWORD_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Forgot password error:', errorData);
      return res.status(response.status).json({ message: 'Failed to send password reset email', error: errorData });
    }

    const data = await response.json();
    res.json({ message: 'Password reset email sent successfully', data });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send password reset email' });
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

    // Fetch customer data from WooCommerce
    const customerId = userData.id; // Assuming the WordPress user ID is the same as the WooCommerce customer ID
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
    // 1. Obtain an admin token
    const adminResponse = await fetch(JWT_LOGIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
    });

    if (!adminResponse.ok) {
      const errorData = await adminResponse.json();
      return res.status(401).json({ message: 'Failed to get admin token', error: errorData });
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
      return res.status(userResponse.status).json({ message: 'Failed to create user', error: errorData });
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
      // Consider how to handle this error - maybe log it or notify an admin
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
}
