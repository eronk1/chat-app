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
import http from 'http';
import { Server } from 'socket.io';
import { socketAuthMiddleware, sendDirectMessage, intervalVerifyAccessTokens, setAccessToken, socketOnDisconnect } from './socket-io/authenticate-socket-connection.js';
import { createGroupChat, addUserToGroupChat, sendGroupMessage, leaveGroupChat, groupMessageTyping, joinGroupRoom, leaveGroupRoom  } from './socket-io/group-functions.js';
import { getDirectChannelForUser } from './user-scripts/createDirectChannel.js';
import { realTimeTypingSocket, directMessageJoinGroup, directMessageLeaveGroup } from './socket-io/transparency-functions.js';
import { socketAddUserJoinGroup } from './socket-io/authenticate-socket-connection.js';

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE']
  }
})

export let redisClient = Redis.createClient({url: 'redis://localhost:6379' } )


redisClient.connect().then(() => {
    console.log('connected to Redis server');
});

const mongoURI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@clustertest.ypjqomh.mongodb.net/chatAppDB?retryWrites=true&w=majority`;

mongoose.connect(mongoURI)
    .then((data)=>{
      console.log('connected to mongodb')
    })
    .catch(err=>console.log(err));



app.use(cors({origin: 'http://localhost:5173',credentials: true}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
app.get('/getUserData', verifyToken, async (req, res) => await getUserData(req,res));
app.get('/channel/@me/:id', verifyToken, async (req, res) => await getUser(req,res));
app.get('/channel/getDirectChannel/:username', verifyToken, async (req, res) => await getDirectChannelForUser(req,res));

// app.post('/friendRequest', verifyToken, async (req, res) => await friendRequest(req, res));
// app.post('/acceptFriendRequest', verifyToken, async (req, res) => await acceptFriendRequest(req, res));
app.post('/channel/@me/:id', verifyToken, async (req, res) => await addMessageDirectChannel(req, res));


// app.delete('/declineFriendRequest/:username', verifyToken, async (req, res) => await declineFriendRequest(req, res));
// app.delete('/cancelFriendRequest/:username', verifyToken, async (req, res) => await cancelFriendRequest(req, res));
// app.delete('/removeFriend/:username', verifyToken, async (req, res) => await removeFriend(req, res));


io.use((socket, next) => socketAuthMiddleware(socket, next)); // check if user is authenticated before allowing socket connection
io.use(async (socket,next) => await socketAddUserJoinGroup(socket,next));

//verify access token every 15 minutes
setInterval(() => intervalVerifyAccessTokens(), 15 * 60 * 1000);


io.on('connection', (socket) => {
  console.log(`Authenticated user connected: ${socket.id}`);
  console.log('User data:', socket.userData);
  socket.on("send-group-message", async (data) => await sendGroupMessage(data, socket))
  socket.on('send-direct-message', async (data) => await sendDirectMessage(data, socket))
  socket.on('set-access-token', async (data) => await setAccessToken(data, socket))
  
  socket.on('direct-message-typing', (data) => realTimeTypingSocket(data,socket))
  socket.on('direct-message-join', (data) => directMessageJoinGroup(data,socket))
  socket.on('direct-message-leave', (data) => directMessageLeaveGroup(data,socket))

  socket.on('createGroupChat', (data, ack) => createGroupChat(data,socket,ack))
  socket.on('addUserToGroupChat', (data, ack) => addUserToGroupChat(data,socket,ack))
  socket.on('sendGroupMessage', (data, ack) => sendGroupMessage(data,socket,ack))
  socket.on('leaveGroupChat', (data, ack) => leaveGroupChat(data,socket,ack))
  socket.on('groupMessageTyping', (data, ack) => groupMessageTyping(data,socket))
  socket.on('joinRoom', (data, ack) => joinGroupRoom(data,socket,ack))
  socket.on('leaveRoom', (data,ack) => leaveGroupRoom(data,socket,ack))

  socket.on('friendRequest', async (data,ack) => await friendRequest(data, ack));
  socket.on('acceptFriendRequest', async (data, ack) => await acceptFriendRequest(data,ack));
  socket.on('declineFriendRequest', async (data, ack) => await declineFriendRequest(data,ack));
  socket.on('cancelFriendRequest', async (data, ack) => await cancelFriendRequest(data,ack));
  socket.on('removeFriend', async (data, ack) => await removeFriend(data,ack));

  socket.on('disconnect', async () => await socketOnDisconnect(socket));
});



server.listen(process.env.CHAT_SERVER_LOCAL_PORT, () => {
  console.log(`Server running at http://localhost:${process.env.CHAT_SERVER_LOCAL_PORT}`);
});