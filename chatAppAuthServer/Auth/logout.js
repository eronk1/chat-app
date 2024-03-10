import { User, refreshToken } from '../database/database.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js'
import { deleteCacheRefreshDB } from '../database/redisCags2.js';
export default async function renewRefresh(req,res){
    const refreshTokenData = req.body.refreshToken;
    const parts = refreshTokenData.split('.');
    if (parts.length !== 3) {
        return res.sendStatus(403);
    }

    const payload = parts[1];
    const decodedPayload = base64UrlDecode(payload);
    if (refreshTokenData == null) return res.sendStatus(401)

    const user = await getOrRefreshCheckSetCache(`refreshToken:${decodedPayload.username}`, async() => await refreshToken.findOne({ refreshToken: refreshTokenData }));
    if (!user) return res.status(404).json({valid:true});
    if(user.refreshToken !== refreshTokenData) return res.sendStatus(403);
    jwt.verify(refreshTokenData, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403)
        let val = await deleteCacheRefreshDB(`refreshToken:${decodedPayload.username}`,async()=>await refreshToken.deleteOne({
            refreshToken: refreshTokenData
        }));
        console.log(val)
        return res.status(200).json({valid:true});
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