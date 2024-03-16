import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); 

const verifyToken = (req, res, next) => {
  try {
    const authHeader2 = req.headers.authorization2;
    if (authHeader2){
      const token = authHeader2.startsWith('Bearer ') ? authHeader2.slice(7) : authHeader2;
      if (!token) throw new Error('Token2 is missing');

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_USER_DATA, (err, decoded) => {
        if (err) throw new Error('Invalid token2');
      });
    }
    
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
