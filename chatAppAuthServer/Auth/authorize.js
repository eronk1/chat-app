import { User, refreshToken } from '../database/database.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js'
import { getOrRefreshCheckSetCache } from '../database/redisCags2.js';

export default async function authorize(req,res){
    const refreshTokenData = req.body.refreshToken;
    if (refreshTokenData == null) return res.sendStatus(401)
    
    const parts = refreshTokenData.split('.');
    if (parts.length !== 3) {
        return res.sendStatus(403);
    }
    const payload = parts[1];
    const decodedPayload = base64UrlDecode(payload);

    const payloadObj = JSON.parse(decodedPayload);


    const user = await getOrRefreshCheckSetCache(`refreshToken:${payloadObj.username}`, async() => await refreshToken.findOne({ refreshToken: refreshTokenData }));

    if (!user) return res.sendStatus(403)
    jwt.verify(refreshTokenData, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        
        const users = {
            username: payloadObj.username,
            gender: payloadObj.gender,
            age: payloadObj.age,
            preferredName: payloadObj.preferredName
        };
        
        const accessToken = jwt.sign(users, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRATION_TIME}m` })
        return res.status(200).json({ accessToken: accessToken })
    })
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
