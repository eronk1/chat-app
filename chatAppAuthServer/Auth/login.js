import { User } from '../database/database.js';
import antonPro from '../database/antonPro.js';
import bcrypt from 'bcrypt';
import { User, refreshToken } from '../database/database.js';
import jwt from 'jsonwebtoken';

export default async function login(req,res){
    try{
        let newUser = await User.findOne({username: req.body.username});
        if(!newUser) return res.json({valid:false, message:"Username or Password Incorrect"})
        if(authenticateUser(req.body.username,req.body.password))
        
    }catch(e){
        console.log(e);
        return done(null,false,{message: 'Something went wrong'})
    }
}

const authenticateUser = async (username,password,done)=>{
    let user = await User.findOne({username: req.body.username});
    if(user==null){
        console.log("user incorect")
        return {valid:false, message:"Username or Password Incorrect"};
    }
    try{
        if(await bcrypt.compare(password,user.password)){
            return {valid:true}
        }else{
            console.log(user)
            console.log("Pass incorect")
            return {valid: false, message: 'Username or Password Incorrect'};
        }
    }catch(e){
        console.log("errored")
        return {valid:false, message: 'Something went wrong'}
    }
}