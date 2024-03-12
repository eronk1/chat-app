import { io } from "../server";
import 'dotenv/config.js';
import jwt from "jsonwebtoken";
import { redisClient } from "../server";
import getOrSetCache from "../database/getOrSetCache.js";
import { UserSummary, GroupMessages } from "../database/database.js";

export function socketAuthMiddleware(socket, next) {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token not provided'));
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error: Token is invalid'));
        }

        socket.userData = decoded; 
        next(); 
    });
}


export async function socketAddUserJoinGroup(socket,next){
    try {
        const username = socket.userData.username;
        await redisClient.hSet('socketUsernames', username, socket.id);
    
        let getUserSumamry = await getOrSetCache(`userSummary:${acceptingUserUsername}`, async () => await UserSummary.findOne({ username: username}));
        let {ServerChannels, groupChannels} = getUserSumamry
        
        for (const channel of groupChannels) {
            if (io.sockets.adapter.rooms.has(channel._id)) {
                socket.join(`getNotified:${channel._id}`);
            }
        }
    
        for (const channel of ServerChannels) {
            socket.join(`getNotified:${channel._id}`);
        }

        next();
      } catch (error) {
        console.error('Error in middleware:', error);
        next(error);
      }
}


export async function sendGroupMessage(data, socket) {
    const groupId = data.groupId;
    const senderUsername = socket.userData.username;
    
    try {
        
        let { groupChannels } = await getOrSetCache(`userSummary:${senderUsername}`, async () => {
            return await UserSummary.findOne({ username: senderUsername });
        });

        if (!groupChannels.some(data => data._id === groupId)) {
            console.log('Unauthorized: Sender is not a member of the group');
            return;
        }

        // Create the room if it doesn't exist and join everyone in the group
        
        if(io.sockets.adapter.rooms.has(roomName)){
            let { groupMembers } = await getOrSetCache(`GroupMessages:${groupId}`, async () => {
                return await GroupMessages.findOne({ _id: groupId });
            });
            for (const member of groupMembers) {
                const memberSocketId = await redisClient.hGet(socketIdKey, member);
            
                if (memberSocketId) {
                    const memberSocket = io.sockets.sockets[memberSocketId];
                    if (memberSocket) {
                        memberSocket.join(groupId);
                    }
                }
            }
        }
        
        socket.to(groupId).emit("group-message", {
            sender: senderUsername,
            message: data.message,
        });
    } catch (error) {
        console.error('Error in sendGroupMessage:', error);
    }
}

const verifyAccessToken = (socket) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        // Handle the case where no token is provided
        return false;
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, 'your_secret_key');
        socket.userData = decoded;
        return true;
    } catch (error) {
        // Handle the case where token verification fails
        return false;
    }
};

export function intervalVerifyAccessTokens(){
    io.sockets.sockets.forEach((socket) => {
    if (!verifyAccessToken(socket)) {
        socket.disconnect(true);
    }
    });
}