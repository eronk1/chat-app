import { io } from "../server.js";
import 'dotenv/config.js';
import jwt from "jsonwebtoken";
import { redisClient } from "../server.js";
import getOrSetCache, {setCache} from "../database/getOrSetCache.js";
import { UserSummary, GroupMessages, DirectMessages } from "../database/database.js";
import { realTimeTypingSocket } from "./transparency-functions.js";
import { getDirectMessagesIncrement } from "../direct-message-scripts/get-user-channel.js";
export function socketAuthMiddleware(socket, next) {
    const token = socket.handshake.auth.token;
    const sessionId = socket.handshake.auth.sessionId;
    if (!token) {
        return next(new Error('Authentication error: Token not provided'));
    }
    if(!sessionId){
        return next(new Error('Authentication error: sessionId not provided'));
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error: Token is invalid'));
        }
        socket.accessToken = token;
        socket.userData = decoded;
        socket.sessionId = sessionId; 
        next(); 
    });
}

export async function socketOnDisconnect(socket){
    const username = socket.userData.username;
    const sessionId = socket.sessionId; 
  
    try {
      const sessionInfoJson = await redisClient.hGet('userSockets', username);
      if (sessionInfoJson) {
        let sessionInfo = JSON.parse(sessionInfoJson);
        
        delete sessionInfo[sessionId];
        
        if (Object.keys(sessionInfo).length === 0) {
          await redisClient.hDel('userSockets', username);
        } else {
          await redisClient.hSet('userSockets', username, JSON.stringify(sessionInfo));
        }
      }
  
      console.log('User disconnected:', username);
    } catch (error) {
      console.error('Error on socket disconnect:', error);
    }
  };



const verifyAccessToken = (socket) => {
    const token = socket.accessToken;

    if (!token) {
        // Handle the case where no token is provided
        return false;
    }

    try {
        // Verify the token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return true;
    } catch (error) {
        // Handle the case where token verification fails
        return false;
    }
};

export function intervalVerifyAccessTokens(){
    io.sockets.sockets.forEach((socket) => {
    if (!verifyAccessToken(socket)) {
        console.log('disconnected',socket.accessToken)
        socket.disconnect(true);
    }
    });
}

export async function sendDirectMessage(data, socket) {
    const recipientUsername = data.username;
    const directChannelId = data.id;
    const senderUsername = socket.userData.username;
    const messageContent = data.message;
    const timestamp = new Date().toISOString();
    try {
        let getDirectChannel = async () => {
            return await DirectMessages.findOne(
                { _id: directChannelId },
                { messages: { $slice: -getDirectMessagesIncrement } }
            );
        };
        let directChannel = await getDirectChannel();

        if (!directChannel.users.includes(senderUsername) || !directChannel.users.includes(recipientUsername)) {
            console.log('Unauthorized: Sender or recipient is not a member of the direct messages');
            return;
        }

        await DirectMessages.findOneAndUpdate(
            { _id: directChannelId },
            { $push: { messages: { message: messageContent, timestamp, sender: senderUsername } } },
            { new: false }  // Set 'new' to false to not return the updated document
        );

        // Emit to the sender
        const senderSessionInfoJson = await redisClient.hGet('userSockets', senderUsername);
        if (senderSessionInfoJson) {
            const senderSessionInfo = JSON.parse(senderSessionInfoJson);
            // Emit to all session IDs of the sender
            Object.values(senderSessionInfo).forEach(senderSocketId => {
                io.to(senderSocketId).emit('direct-message', {
                    sender: senderUsername,
                    message: messageContent,
                    timestamp,
                    id: directChannelId
                });
            });
            // realTimeTypingSocket({directChannelId, message:''},socket);
        }

        // Handling multiple sessions for the recipient
        if (senderUsername !== recipientUsername) {
            const sessionInfoJson = await redisClient.hGet('userSockets', recipientUsername);
            if (sessionInfoJson) {
                const sessionInfo = JSON.parse(sessionInfoJson);
                Object.values(sessionInfo).forEach(recipientSocketId => {
                    io.to(recipientSocketId).emit('direct-message', {
                        sender: senderUsername,
                        message: messageContent,
                        timestamp,
                        id: directChannelId
                    });
                });
                console.log(`Data emitted to ${recipientUsername}`);
            } else {
                console.log(`${recipientUsername} does not have a socket ID stored in Redis.`);
            }
        }
    } catch (error) {
        console.error('Error in sendDirectMessage:', error);
    }
}

export async function setAccessToken(data,socket){
    const token = data.accessToken;
    try {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.accessToken = token;
        console.log(token, 'set')
    } catch (error) {
        console.log(`Problem setting accessToken in socket ${error}`)
    }
}


const updateSocketInfo = async (username, sessionId, socketId) => {
    
    let userInfo = await redisClient.hGet('userSockets', username);
  
    let sessionsInfo;
    if (userInfo) {
      sessionsInfo = JSON.parse(userInfo);
    } else {
      sessionsInfo = {};
    }
  
    sessionsInfo[sessionId] = socketId;
  
    await redisClient.hSet('userSockets', username, JSON.stringify(sessionsInfo));
  };
  
  export async function socketAddUserJoinGroup(socket,next){
    try {
        const username = socket.userData.username;
        await updateSocketInfo(username,socket.sessionId,socket.id)
        next();
      } catch (error) {
        console.error('Error in middleware:', error);
        next(error);
      }
    }