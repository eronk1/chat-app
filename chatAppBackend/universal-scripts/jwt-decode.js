import jwt from 'jsonwebtoken';


export default function decodeJwt(token) {
    try {
      const bearerToken = token.split(' ')[0].toLowerCase() === 'bearer' ? token.split(' ')[1] : token;
  
      const decoded = jwt.decode(bearerToken, { complete: true });
      if (!decoded) {
        return { error: 'Failed to decode token.' };
      }
      return decoded.payload;
    } catch (error) {
      return { error: error.message };
    }
  }
