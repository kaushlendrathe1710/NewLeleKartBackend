import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token against WordPress API
    const validationResponse = await fetch(`${process.env.WP_BASE_URL}/wp-json/jwt-auth/v1/token/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!validationResponse.ok) {
      return res.status(401).send({ message: 'Invalid token' });
    }

    // Decode token to extract user information
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your actual secret key
    req.user = { id: decoded.data.user.id }; // Assuming the user ID is in decoded.data.user.id
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).send({ message: 'Invalid token' });
  }
};

export default verifyJWT;
