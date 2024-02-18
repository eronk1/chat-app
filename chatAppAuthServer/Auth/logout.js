import { User, refreshToken } from '../database/database.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js'

export default async function renewRefresh(req,res){
    const refreshTokenData = req.body.refreshToken;
    if (refreshTokenData == null) return res.sendStatus(401)

    const user = await refreshToken.findOne({ refreshToken: refreshTokenData });
    if (!user) return res.sendStatus(403)
    if(user.refreshToken !== refreshTokenData) return res.sendStatus(403);
    jwt.verify(refreshTokenData, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403)
        let val = await refreshToken.deleteOne({
            refreshToken: refreshTokenData
        });
        console.log(val)
        return res.status(200).json({valid:true});
    })
}