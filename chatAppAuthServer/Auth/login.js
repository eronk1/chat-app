import antonPro from '../database/antonPro.js';
import bcrypt from 'bcrypt';
import { User, refreshToken } from '../database/database.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js'

export default async function login(req,res){
    try{
        let newUser = await User.findOne({username: req.body.username});
        let refreshFind = await refreshToken.findOne({username:req.body.username});
        console.log("test test test test")
        console.log(refreshFind)
        console.log("test test test test")
        if(refreshFind.username == req.body.username){
            let authVal = await authenticateUser(req.body.password, newUser, true);
            if(authVal.valid){
                const users = {
                    username: newUser.username,
                    gender: newUser.gender,
                    age: newUser.age,
                    preferredName: newUser.preferredName
                };
                const newExpirationDate = new Date(Date.now() + process.env.REFRESH_TOKEN_EXPIRATION_TIME*60*60*1000); // 10 minutes from now
                const accessToken = jwt.sign(users, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRATION_TIME}m` })
                await refreshToken.updateOne(
                    { username: req.body.username },
                    { $set: { expiresAt: newExpirationDate } } 
                );
                console.log({valid:true, refreshToken: refreshFind.refreshToken, accessToken:accessToken})
                return res.status(200).json({valid:true, refreshToken: refreshFind.refreshToken, accessToken:accessToken});
            }
            return res.status(401).json(authVal);
        }
        if(!newUser) return res.status(403).json({valid:false, message:"Username or Password Incorrect"});
        const returnMessage = await authenticateUser(req.body.password, newUser, false);
        if(!returnMessage.valid)return res.status(401).json(returnMessage);
        return res.status(201).json(returnMessage);
        
        
    }catch(e){
        console.log(e);
        return {valid:false, message: 'Something went wrong'};
    }
}

const authenticateUser = async (password,user,updatePossible)=>{
    if(user==null){
        console.log("user incorrect")
        return {valid:false, message:"Username or Password Incorrect"};
    }
    const users = {
        username: user.username,
        gender: user.gender,
        age: user.age,
        preferredName: user.preferredName
    };
    try{
        if(await bcrypt.compare(password,user.password)){
            if(!updatePossible){
                const accessToken = jwt.sign(users, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRATION_TIME}m` })
                const refreshTokenObject = jwt.sign(users, process.env.REFRESH_TOKEN_SECRET, { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRATION_TIME}h` })
                const newExpirationDate = new Date(Date.now() + process.env.REFRESH_TOKEN_EXPIRATION_TIME*60*60*1000); // 10 minutes from now
                let storeRefreshToken = new refreshToken({username: user.username, refreshToken: refreshTokenObject, expiresAt: newExpirationDate })
                storeRefreshToken.save();
                return {valid:true, refreshToken:refreshTokenObject, accessToken:accessToken};
            }
            return {valid:true};
        }else{
            console.log(user)
            console.log("Pass incorect")
            return {valid: false, message: 'Username or Password Incorrect'};
        }
    }catch(e){
        console.log(e)
        return {valid:false, message: 'Something went wrong'}
    }
}