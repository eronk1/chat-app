import jwt from 'jsonwebtoken';


export default function decodeJwt(token) {
    try {
      if(!token) return null;
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
