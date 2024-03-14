import antonPro from '../database/antonPro.js';
import bcrypt from 'bcrypt';
import { User, refreshToken } from '../database/database.js';
import jwt from 'jsonwebtoken';
import { getOrRefreshCheckSetCache, updateKeyExpiration, getOrSetCache, setCacheRefreshDB } from '../database/redisCags2.js';


export default async function signUp(req,res){
    try{
        console.log(req.body)
        let findUser = await User.findOne({username: req.body.username}, { _id: 1 });
        if(findUser) return res.status(400).json({valid:false,field:'username', mistake:'usernameExist',message:'Username already in use'});
        let check = antonPro(req.body);
        if(!check.valid){
            return res.status(400).json(check);
        };
        let password = await bcrypt.hash(req.body.password,10);
        let makeNewUserData = {
            username: req.body.username,
            password: password,
            gender: req.body.gender,
            age: req.body.age,
            preferredName: req.body.preferredName
        };
        console.log(makeNewUserData)
            let newUser = new User(makeNewUserData);
            newUser.save();
            
        const user = {
            username: req.body.username,
            gender: req.body.gender,
            age: req.body.age,
            preferredName: req.body.preferredName
        };

        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRATION_TIME}m` })
        const refreshTokenObject = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        const newExpirationDate = new Date(Date.now() + process.env.REFRESH_TOKEN_EXPIRATION_TIME*60*60*1000);
        
        await setCacheRefreshDB(`refreshToken:${user.username}`, async () => {
            let storeRefreshToken = new refreshToken({username: req.body.username, refreshToken: refreshTokenObject, expiresAt: newExpirationDate })
            storeRefreshToken.save();
            return storeRefreshToken;
        } )
        return res.status(201).json({valid:true, accessToken: accessToken, refreshToken: refreshTokenObject })
    }catch(e){
        console.log(e);
    }
}