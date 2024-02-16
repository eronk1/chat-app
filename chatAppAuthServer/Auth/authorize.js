import { User, refreshToken } from '../database/database.js';
import jwt from 'jsonwebtoken';

export default async function authorize(req,res){
    const refreshTokenData = req.body.refreshToken;
    if (refreshTokenData == null) return res.sendStatus(401)

    const user = await refreshToken.findOne({ username: req.body.username });

    if (!user) return res.sendStatus(403)
    
    jwt.verify(refreshTokenData, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        res.json({ accessToken: accessToken })
    })
}
