import { io } from "../server.js";
import 'dotenv/config.js';
import jwt from "jsonwebtoken";
import { redisClient } from "../server.js";
import getOrSetCache, {setCache} from "../database/getOrSetCache.js";
import { UserSummary, GroupMessages, DirectMessages } from "../database/database.js";

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
    const sessionId = socket.sessionId; // Assuming the socket.id was used as the sessionId when storing
  
    try {
      // Fetch the current session info for the user
      const sessionInfoJson = await redisClient.hGet('userSockets', username);
      if (sessionInfoJson) {
        let sessionInfo = JSON.parse(sessionInfoJson);
        
        // Remove the disconnected session
        delete sessionInfo[sessionId];
        
        // If there are no more sessions left for the user, remove the user's entry from Redis
        if (Object.keys(sessionInfo).length === 0) {
          await redisClient.hDel('userSockets', username);
        } else {
          // Otherwise, update the user's session info in Redis
          await redisClient.hSet('userSockets', username, JSON.stringify(sessionInfo));
        }
      }
  
      console.log('User disconnected:', username);
    } catch (error) {
      console.error('Error on socket disconnect:', error);
    }
  };

export async function socketAddUserJoinGroup(socket,next){
    try {
        const username = socket.userData.username;
        await updateSocketInfo(username,socket.sessionId,socket.id)
    
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

        if (!groupChannels.some(data => data._id.toString() === groupId)) {
            console.log('Unauthorized: Sender is not a member of the group');
            return;
        }

        let { groupMembers } = await getOrSetCache(`GroupMessages:${groupId}`, async () => {
            return await GroupMessages.findOne({ _id: groupId });
        });

        // Assuming `roomName` should be `groupId`
        if (io.sockets.adapter.rooms.has(groupId)) {
            for (const member of groupMembers) {
                // Retrieve the session info for the member
                const sessionInfoJson = await redisClient.hGet('userSockets', member);
                if (sessionInfoJson) {
                    const sessionInfo = JSON.parse(sessionInfoJson);
                    // Join each socket associated with the member to the group
                    Object.values(sessionInfo).forEach(socketId => {
                        const memberSocket = io.sockets.sockets.get(socketId);
                        if (memberSocket) {
                            memberSocket.join(groupId);
                        }
                    });
                }
            }
        }
        
        // Emit the message to the group
        io.to(groupId).emit("group-message", {
            sender: senderUsername,
            message: data.message,
        });
    } catch (error) {
        console.error('Error in sendGroupMessage:', error);
    }
}

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
        let directChannel = await getOrSetCache(`directMessages:${directChannelId}`, async () => {
            return await DirectMessages.findOne({ _id: directChannelId });
        });

        if (!directChannel.users.includes(senderUsername) || !directChannel.users.includes(recipientUsername)) {
            console.log('Unauthorized: Sender or recipient is not a member of the direct messages');
            return;
        }

        await setCache(`directMessages:${directChannelId}`, async () => {
            return DirectMessages.findOneAndUpdate(
                { _id: directChannelId },
                { $push: { messages: { message: messageContent, timestamp, sender: senderUsername } } },
                { new: true }
            );
        });

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