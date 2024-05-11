import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config.js';
import mongoose from 'mongoose';
import signUp from './Auth/signUp.js';
import authorize from './Auth/authorize.js'
import login from './Auth/login.js';
import renewRefresh from './Auth/renewRefresh.js';
import logout from './Auth/logout.js';
import { User, refreshToken  } from './database/database.js';
import Redis from 'redis'

export const redisClient = Redis.createClient({url: 'redis://redis:6379' } )
redisClient.connect().then(() => {
    console.log('Connected to Redis server');
});

//SIGN UP
// let authVal = {
//   username: inputValues.inputUsername,
//   password: inputValues.inputPassword,
//   confirmPassword: inputValues.inputConfirmPassword,
//   gender: inputValues.inputGender
// }

// LOGIN
// let authVal = {
//   username: inputValues.inputUsername,
//   password: inputValues.inputPassword
// }


// use session storage for jwt tokens

const app = express();


const mongoURI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@clustertest.ypjqomh.mongodb.net/chatAppDB?retryWrites=true&w=majority`;

mongoose.connect(mongoURI)
    .then((data)=>{
      console.log('connected')
    })
    .catch(err=>console.log(err));


app.use(cors({origin: 'http://localhost:5173',credentials: true}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.post('/login',async (req, res) => await login(req,res))
app.post('/accessToken', async (req, res) => await authorize(req,res));
app.post('/signUp', async (req,res)=> await signUp(req,res));
app.post('/renewRefreshToken', async (req,res)=> await renewRefresh(req,res));


app.delete('/logout', async (req, res) => await logout(req,res));

app.listen(process.env.AUTH_SERVER_LOCAL_PORT, () => {
  console.log(`Server running at http://localhost:${process.env.AUTH_SERVER_LOCAL_PORT}`);
});