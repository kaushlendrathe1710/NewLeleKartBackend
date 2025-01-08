const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const response = await fetch(`${process.env.WP_BASE_URL}/wp-json/jwt-auth/v1/token/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      next();
    } else {
      return res.status(401).send({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).send({ message: 'Failed to validate token' });
  }
};

export default verifyJWT;
