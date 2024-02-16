import antonPro from '../database/antonPro.js';
import bcrypt from 'bcrypt';
import { User, refreshToken } from '../database/database.js';
import jwt from 'jsonwebtoken';

export default async function signUp(req,res){
    try{
        let check = antonPro(req.body);
        if(!check.valid){
            res.json(check)
            return;
        };
        let password = await bcrypt.hash(req.body.password,10);
        let makeNewUserData = {
            username: req.body.username,
            password: password,
            gender: req.body.gender,
            age: req.body.age,
            preferredName: req.body.preferredName
        };
        let newUser = new User(makeNewUserData);
        newUser.save();
        const user = {
            username: req.body.username,
            gender: req.body.gender,
            age: req.body.age,
            preferredName: req.body.preferredName
        };

        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        const refreshTokenObject = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        let storeRefreshToken = new refreshToken({username: req.body.username, refreshToken: refreshTokenObject})
        storeRefreshToken.save();
        res.json({ accessToken: accessToken, refreshToken: refreshTokenObject })
    }catch(e){
        console.log(e);
    }
}