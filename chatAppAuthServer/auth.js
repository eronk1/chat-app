import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config.js';
import mongoose from 'mongoose';
import signUp from './Auth/signUp.js';
import authorize from './Auth/authorize.js'
import { User, refreshToken  } from './database/database.js';

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

// initializePassport(passport, async (username) => await User.findOne({username:username}),async (id) => await User.findById(id));



app.use(cors({origin: 'http://localhost:5173',credentials: true}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.post('/accessToken', async (req, res) => await authorize(req,res));
app.post('/signUp', async (req,res)=> await signUp(req,res));


app.delete('/logout', (req, res) => {
  
});

app.listen(process.env.AUTH_SERVER_LOCAL_PORT, () => {
  console.log(`Server running at http://localhost:${process.env.AUTH_SERVER_LOCAL_PORT}`);
});