import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); 

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('Authorization header is missing');

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) throw new Error('Token is missing');

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) throw new Error('Invalid token');
      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export default verifyToken;
