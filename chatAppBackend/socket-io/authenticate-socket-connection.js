import { io } from "../server.js";
import 'dotenv/config.js';
import jwt from "jsonwebtoken";
import { redisClient } from "../server.js";
import getOrSetCache, {setCache} from "../database/getOrSetCache.js";
import { UserSummary, GroupMessages, DirectMessages } from "../database/database.js";

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
    
        let getUserSumamry = await getOrSetCache(`userSummary:${username}`, async () => await UserSummary.findOne({ username: username}));
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

export async function sendDirectMessage(data, socket) {
    const recipientUsername = data.username;
    const directChannelId = data.id;
    const senderUsername = socket.userData.username;
    const messageContent = data.message;
    const timestamp = new Date().toISOString();
    console.log(data)

    try {
        let directChannel = await getOrSetCache(`directMessages:${directChannelId}`, async () => {
            return await DirectMessages.findOne({ _id: directChannelId });
        });

        if (!directChannel.users.includes(senderUsername) || !directChannel.users.includes(recipientUsername)) {
            console.log('Unauthorized: Sender or recipient is not a member of the direct messages');
            return;
        }

        // Assuming setCache is correctly implemented and used here
        await DirectMessages.findOneAndUpdate(
            { _id: directChannelId },
            { $push: { messages: { message: messageContent, timestamp, sender: senderUsername } } },
            { new: true }
        );

        // Emit to the sender
        io.to(socket.id).emit('direct-message', {
            sender: senderUsername,
            message: messageContent,
            timestamp
        });

        // Emit to the recipient if different from sender
        if (senderUsername !== recipientUsername) {
            const recipientSocketId = await redisClient.hGet('socketUsernames', recipientUsername);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('direct-message', {
                    sender: senderUsername,
                    message: messageContent,
                    timestamp
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

