import { io } from "../server.js";
import 'dotenv/config.js';
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { redisClient } from "../server.js";
import getOrSetCache, {setCache} from "../database/getOrSetCache.js";
import { UserSummary, GroupMessages, DirectMessages } from "../database/database.js";
import { realTimeTypingSocket } from "./transparency-functions.js";
import { getDirectMessagesIncrement } from "../direct-message-scripts/get-user-channel.js";


// export async function sendGroupMessage(data, socket) {
//     const groupId = data.groupId;
//     const senderUsername = socket.userData.username;
    
//     try {
//         let { groupChannels } = await getOrSetCache(`userSummary:${senderUsername}`, async () => {
//             return await UserSummary.findOne({ username: senderUsername });
//         });

//         if (!groupChannels.some(data => data._id.toString() === groupId)) {
//             console.log('Unauthorized: Sender is not a member of the group');
//             return;
//         }

//         let { groupMembers } = await getOrSetCache(`GroupMessages:${groupId}`, async () => {
//             return await GroupMessages.findOne({ _id: groupId });
//         });

//         // Assuming `roomName` should be `groupId`
//         if (io.sockets.adapter.rooms.has(groupId)) {
//             for (const member of groupMembers) {
//                 // Retrieve the session info for the member
//                 const sessionInfoJson = await redisClient.hGet('userSockets', member);
//                 if (sessionInfoJson) {
//                     const sessionInfo = JSON.parse(sessionInfoJson);
//                     // Join each socket associated with the member to the group
//                     Object.values(sessionInfo).forEach(socketId => {
//                         const memberSocket = io.sockets.sockets.get(socketId);
//                         if (memberSocket) {
//                             memberSocket.join(groupId);
//                         }
//                     });
//                 }
//             }
//         }
        
//         // Emit the message to the group
//         io.to(groupId).emit("group-message", {
//             sender: senderUsername,
//             message: data.message,
//         });
//     } catch (error) {
//         console.error('Error in sendGroupMessage:', error);
//     }
// }


async function verifyMembership(username, groupId) {
    const userSummary = await getOrSetCache(`userSummary:${username}`, async () => {
        return await UserSummary.findOne({ username: username });
    });

    return userSummary.groupChannels.some(channel => channel._id.toString() === groupId);
}

async function verifyFriendship(creatorUsername, members) {
    const creatorSummary = await getOrSetCache(`userSummary:${creatorUsername}`, async () => {
        return await UserSummary.findOne({ username: creatorUsername });
    });

    for (let member of members) {
        if (member === creatorUsername) continue;
        if (!creatorSummary.friends.some(({ name }) => name === member)) {
            return false;
        }
    }
    return true;
}

export async function createGroupChat(data, socket, ack) {
    let { groupName, members } = data;
    const creatorUsername = socket.userData.username;

    try {
        if (!await verifyFriendship(creatorUsername, members)) {
            if (ack) ack({ status: 403, error: 'Unauthorized: Members are not friends' });
            return;
        }

        const newGroup = new GroupMessages({
            _id: new mongoose.Types.ObjectId(),
            users: [creatorUsername, ...members],
            channelName: groupName,
            timestamp: new Date().toISOString(),
            messages: []
        });

        const savedGroup = await newGroup.save();
        members = [creatorUsername,...members]
        for (const member of members) {
            
        console.log('check point 1')
            await setCache(`userSummary:${member}`, async () => {
                const userSummary = await UserSummary.findOneAndUpdate(
                    { username: member },
                    { $push: { groupChannels: { _id: savedGroup._id, channelName: groupName, users: [...members] } } },
                    { new: true, upsert: false }
                );
                return userSummary;
            });
            
        console.log('check point 2',member)

            const memberSocket = await redisClient.hGet('userSockets', member);
            if (memberSocket) {
                const sessionInfo = JSON.parse(memberSocket);
                Object.values(sessionInfo).forEach(socketId => {
                    const memberSocket = io.sockets.sockets.get(socketId);
                    if (memberSocket) {
                        memberSocket.join(savedGroup._id.toString());
                    }
                });
            }
        }
        console.log('check point 3')
        socket.join(savedGroup._id.toString());
        io.to(savedGroup._id.toString()).emit('group-created', { groupId: savedGroup._id, groupName });

        if (ack) ack({ status: 201, groupId: savedGroup._id, groupName });

    } catch (error) {
        console.error('Error creating group chat:', error);
        if (ack) ack({ status: 500, error: error.message });
    }
}

export async function addUserToGroupChat(data, socket, ack) {
    const { groupId, newUser } = data;
    const requesterUsername = socket.userData.username;

    try {
        const group = await GroupMessages.findById(groupId);
        if (!group) {
            console.error('Group not found');
            if (ack) ack({ status: 404, error: 'Group not found' });
            return;
        }

        if (!group.users.includes(requesterUsername)) {
            console.error('Unauthorized: Requester is not a member of the group');
            if (ack) ack({ status: 403, error: 'Unauthorized' });
            return;
        }

        if (group.users.includes(newUser)) {
            console.log('User is already a member of the group');
            if (ack) ack({ status: 409, error: 'User already a member' });
            return;
        }

        if (!await verifyFriendship(requesterUsername, [newUser])) {
            if (ack) ack({ status: 403, error: 'Unauthorized: New user is not a friend' });
            return;
        }

        group.users.push(newUser);
        await group.save();

        await setCache(`userSummary:${newUser}`, async () => {
            const userSummary = await UserSummary.findOneAndUpdate(
                { username: newUser },
                { $push: { groupChannels: { _id: groupId, channelName: group.channelName, users: group.users } } },
                { new: true, upsert: false }
            );
            return userSummary;
        });

        const memberSocket = await redisClient.hGet('userSockets', newUser);
        if (memberSocket) {
            const sessionInfo = JSON.parse(memberSocket);
            Object.values(sessionInfo).forEach(socketId => {
                const memberSocket = io.sockets.sockets.get(socketId);
                if (memberSocket) {
                    memberSocket.join(groupId);
                }
            });
        }

        io.to(groupId).emit('user-added', { _id: groupId, name: group.channelName, users: group.users });

        if (ack) ack({ status: 200, _id: groupId, name: group.channelName, users: group.users });

    } catch (error) {
        console.error('Error adding user to group chat:', error);
        if (ack) ack({ status: 500, error: error.message });
    }
}

export async function sendGroupMessage(data, socket, ack) {
    const groupId = data.groupId;
    const senderUsername = socket.userData.username;

    try {
        if (!await verifyMembership(senderUsername, groupId)) {
            console.log('Unauthorized: Sender is not a member of the group');
            if (ack) ack({ status: 403, error: 'Unauthorized' });
            return;
        }

        let group = await GroupMessages.findById(groupId);
        if (!group) {
            console.error('Group not found');
            if (ack) ack({ status: 404, error: 'Group not found' });
            return;
        }
        let postDate = new Date().toISOString();
        group.messages.push({
            message: data.message,
            timestamp: postDate,
            sender: senderUsername
        });
        await group.save();

        io.to(groupId).emit("group-message", {
            sender: senderUsername,
            message: data.message,
            timestamp: postDate
        });

        if (ack) ack({ status: 200 });

    } catch (error) {
        console.error('Error in sendGroupMessage:', error);
        if (ack) ack({ status: 500, error: error.message });
    }
}

export async function leaveGroupChat(data, socket, ack) {
    const { groupId } = data;
    const username = socket.userData.username;

    try {
        const group = await GroupMessages.findById(groupId);
        if (!group) {
            console.error('Group not found');
            if (ack) ack({ status: 404, error: 'Group not found' });
            return;
        }

        group.users = group.users.filter(user => user !== username);
        await group.save();

        await setCache(`userSummary:${username}`, async () => {
            const userSummary = await UserSummary.findOneAndUpdate(
                { username },
                { $pull: { groupChannels: { _id: groupId } } },
                { new: true, upsert: false }
            );
            return userSummary;
        });

        socket.leave(groupId);
        io.to(groupId).emit('user-left', { groupId, username });

        if (ack) ack({ status: 200 });

    } catch (error) {
        console.error('Error leaving group chat:', error);
        if (ack) ack({ status: 500, error: error.message });
    }
}

export async function groupMessageTyping(data, socket) {
    const { groupId, typing } = data;
    const { username } = socket.userData;

    try {
        socket.to(groupId).emit('group-message-typing', {
            username,
            typing,
        });

        console.log(`${username} is ${typing ? 'typing' : 'not typing'} in group ${groupId}`);

    } catch (error) {
        console.error('Error in groupMessageTyping:', error);
    }
}
export async function joinGroupRoom(data, socket, ack) {
    const { groupId } = data;
    const username = socket.userData.username;

    try {
        // Verify the user is a member of the group
        const isMember = await verifyMembership(username, groupId);

        if (!isMember) {
            console.error('Unauthorized: User is not a member of the group');
            if (ack) ack({ status: 403, error: 'Unauthorized' });
            return;
        }

        socket.join(groupId);
        io.to(groupId).emit('user-joined', { groupId, username });

        if (ack) ack({ status: 200 });

    } catch (error) {
        console.error('Error joining room:', error);
        if (ack) ack({ status: 500, error: error.message });
    }
}

// Function for leaving a room
export async function leaveGroupRoom(data, socket, ack) {
    const { groupId } = data;
    const username = socket.userData.username;

    try {
        // Verify the user is a member of the group
        const isMember = await verifyMembership(username, groupId);

        if (!isMember) {
            console.error('Unauthorized: User is not a member of the group');
            if (ack) ack({ status: 403, error: 'Unauthorized' });
            return;
        }

        socket.leave(groupId);
        io.to(groupId).emit('user-left', { groupId, username });

        if (ack) ack({ status: 200 });

    } catch (error) {
        console.error('Error leaving room:', error);
        if (ack) ack({ status: 500, error: error.message });
    }
}