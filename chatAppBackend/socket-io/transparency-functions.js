import { UserSummary } from "../database/database.js";
import getOrSetCache from "../database/getOrSetCache.js";
import jwt from 'jsonwebtoken'
export async function realTimeTypingSocket(data, socket, option) {
    if(option == 1){

    }
    const { groupId, message } = data;
    const username = socket.userData.username; 
    if (!socket.rooms.has(groupId)) {
        console.log('group not found')
        await directMessageJoinGroup(data, socket);
    }
    if (!socket.rooms.has(groupId)) {
        console.error(`Socket ${socket.id} was unable to join the group ${groupId}.`);
        return;
    }
    
    socket.to(groupId).emit('direct-message-typing', {
        username: username,
        message: message,
    });

    console.log(`${username} is typing in group ${groupId}: ${message}`);
}

export async function directMessageJoinGroup(data, socket) {
    const { groupId } = data;
    const username = socket.userData.username;
    if (!groupId) {
        console.error('No groupId provided.');
        return;
    }
    try {
        let { directChannels } = await getOrSetCache(`userSummary:${username}`, async () => {
            return await UserSummary.findOne({ username: username });
        });

        // Check if any of the directChannels have an _id that matches the groupId
        const isMember = directChannels.some(channel => channel._id.toString() === groupId);

        if (!isMember) {
            // Handle the error case if no matching groupId is found
            console.error("Error: User is not a member of the group with ID", groupId);
            return "Error: User is not a member of the specified group.";
        }

        // Proceed with your logic here as the check has passed
        console.log("User is a member of the group. Proceeding with further logic.");
    } catch (error) {
        console.error("An error occurred while checking group membership:", error);
        return "An error occurred while processing your request.";
    }
    // Join the group. If the group doesn't exist, it will be created.
    socket.join(groupId, (error) => {
        if (error) {
            console.error(`Failed to join group ${groupId}: ${error}`);
        } else {
            console.log(`Socket ${socket.id} joined group ${groupId}`);
        }
    });
    realTimeTypingSocket({groupId, message:`joined chat`}, socket)
    console.error(`Group status ${groupId}: ${socket.rooms.has(groupId)}`);
    console.log('end')
}
export function directMessageLeaveGroup(data, socket) {
    const { groupId } = data;

    if (!groupId) {
        console.error('No groupId provided.');
        return;
    }

    // Leave the group. This will automatically handle removing the socket from the room in Socket.IO
    socket.leave(groupId, () => {
        console.log(`Socket ${socket.id} left group ${groupId}`);
    });
}

export async function getFriendSummary(data, socket, ack){
    const { username, token } = data;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            ack({status: 401, message: 'access token is not valid'})
            return;
        }
        socket.accessToken = token;
        socket.userData = decoded;
    });
    let requestingUsername = socket.userData.username;
    let { friends } = await getOrSetCache(`userSummary:${requestingUsername}`, async () => {
        return await UserSummary.findOne({ username:  requestingUsername});
    });
    if(friends.some(friend => friend.name==username)){
        let friendSummary = await getOrSetCache(`userSummary:${username}`, async () => {
            return await UserSummary.findOne({ username:  username});
        });
        if(friendSummary){
            ack({status: 200, friendUserSummary: friendSummary})
        }else{
            ack({status: 404, message: 'friend not found'})
        }
    }else{
        ack({status: 403, message: 'Not friended to this user'})
    }
}