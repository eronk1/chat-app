import { User, refreshToken } from '../database/database.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js'
import { deleteCacheRefreshDB,getOrRefreshCheckSetCache } from '../database/redisCags2.js';
export default async function logout(req, res) {
    const refreshTokenData = req.body.refreshToken;
    if (!refreshTokenData) {
        return res.sendStatus(401); // Check if refreshTokenData is null or undefined first
    }

    const parts = refreshTokenData.split('.');
    if (parts.length !== 3) {
        return res.sendStatus(403); // Invalid token format
    }

    // Assuming base64UrlDecode works correctly and extracts payload
    const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
    if (!decodedPayload.username) {
        return res.status(403).json({message:'invalid token'}); // Invalid token payload
    }

    try {
        const verifiedUser = jwt.verify(refreshTokenData, process.env.REFRESH_TOKEN_SECRET);
        const userCacheKey = `refreshToken:${decodedPayload.username}`;
        const user = await getOrRefreshCheckSetCache(userCacheKey, async () => {
            return refreshToken.findOne({ username: decodedPayload.username});
        });

        if (!user || user.refreshToken !== refreshTokenData) {
            return res.sendStatus(403).json({message:'token mismatch or no user found'}); // No user found or token mismatch
        }

        await deleteCacheRefreshDB(userCacheKey, async () => {
            await refreshToken.deleteOne({ refreshToken: refreshTokenData });
        });

        return res.status(200).json({ valid: true });
    } catch (error) {
        console.error('Error processing logout:', error);
        return res.sendStatus(403); // JWT verification failed or other errors
    }
}
function base64UrlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    let padding = base64.length % 4;
    if (padding !== 0) {
        base64 += new Array(5 - padding).join('=');
    }
    const base64decoded = Buffer.from(base64, 'base64').toString();
    return base64decoded;
}