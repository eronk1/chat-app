import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config.js';
import mongoose from 'mongoose';
import getUserData from './direct-message-scripts/get-user-data.js';
import getUser from './direct-message-scripts/get-user-channel.js'
import verifyToken from './universal-scripts/checkAccessToken.js';
import { friendRequest, acceptFriendRequest, declineFriendRequest, cancelFriendRequest, removeFriend } from './user-scripts/friend.js';
import addMessageDirectChannel from './user-scripts/addMessageDirectChannel.js';
import Redis from 'redis'

export const redisClient = Redis.createClient({url: 'redis://localhost:6379' } )
redisClient.connect().then(() => {
    console.log('connected to Redis server');
});

const mongoURI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@clustertest.ypjqomh.mongodb.net/chatAppDB?retryWrites=true&w=majority`;

mongoose.connect(mongoURI)
    .then((data)=>{
      console.log('connected to mongodb')
    })
    .catch(err=>console.log(err));



const app = express();

app.use(cors({origin: 'http://localhost:5173',credentials: true}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/getUserData', verifyToken, async (req, res) => await getUserData(req,res));
app.get('/channel/@me/:id', verifyToken, async (req, res) => await getUser(req,res));

app.post('/friendRequest', verifyToken, async (req, res) => await friendRequest(req, res));
app.post('/acceptFriendRequest', verifyToken, async (req, res) => await acceptFriendRequest(req, res));
app.post('/channel/@me/:id', verifyToken, async (req, res) => await addMessageDirectChannel(req, res));


app.delete('/declineFriendRequest/:username', verifyToken, async (req, res) => await declineFriendRequest(req, res));
app.delete('/cancelFriendRequest/:username', verifyToken, async (req, res) => await cancelFriendRequest(req, res));
app.delete('/removeFriend/:username', verifyToken, async (req, res) => await removeFriend(req, res));
app.listen(process.env.CHAT_SERVER_LOCAL_PORT, () => {
  console.log(`Server running at http://localhost:${process.env.CHAT_SERVER_LOCAL_PORT}`);
});