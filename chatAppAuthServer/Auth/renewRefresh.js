import { User, refreshToken } from '../database/database.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js'
import { getOrRefreshCheckSetCache, setCacheRefreshDB } from '../database/redisCags2.js';

export default async function renewRefresh(req,res){
    const refreshTokenData = req.body.refreshToken;
    const parts = refreshTokenData.split('.');
    if (parts.length !== 3) {
        return res.sendStatus(403);
    }

    const payload = parts[1];
    const decodedPayload = base64UrlDecode(payload);
    const payloadObj = JSON.parse(decodedPayload);
    if (refreshTokenData == null) return res.sendStatus(401)

    const user = await getOrRefreshCheckSetCache(`refreshToken:${payloadObj.username}`, async() => await refreshToken.findOne({ refreshToken: refreshTokenData }));

    
    if (!user) return res.sendStatus(403)

    if(user.refreshToken !== refreshTokenData) return res.sendStatus(403);

    jwt.verify(refreshTokenData, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403)
        

        const users = {
            username: payloadObj.username,
            gender: payloadObj.gender,
            age: payloadObj.age,
            preferredName: payloadObj.preferredName
        };
        const newExpirationDate = new Date(Date.now() + process.env.REFRESH_TOKEN_EXPIRATION_TIME*60*60*1000);
        const refreshTokenObject = jwt.sign(users, process.env.REFRESH_TOKEN_SECRET)

        await setCacheRefreshDB(`refreshToken:${payloadObj.username}`, async()=>{
            await refreshToken.updateOne(
                { username: payloadObj.username }, 
                { $set: { refreshToken: refreshTokenObject, expiresAt: newExpirationDate } },
                { upsert: true }
            )
            return {refreshToken: refreshTokenObject, expiresAt: newExpirationDate, username: payloadObj.username}   
        });
        
        const accessToken = jwt.sign(users, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRATION_TIME}m` })
        return res.status(200).json({valid:true, accessToken: accessToken, refreshToken: refreshTokenObject })
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