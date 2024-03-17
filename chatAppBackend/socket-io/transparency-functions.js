import { UserSummary } from "../database/database";

export function realTimeTypingSocket(data, socket) {
    
    const { groupId, message } = data;
    const username = socket.userData.username; 

    if (!socket.rooms.has(groupId)) {
        console.error(`Socket ${socket.id} has not joined the group ${groupId}.`);
        return;
    }
    socket.to(groupId).emit('direct-message-typing', {
        username: username,
        message: message,
    });

    console.log(`${username} is typing in group ${groupId}: ${isTyping}`);
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
    socket.join(groupId, () => {
        console.log(`Socket ${socket.id} joined group ${groupId}`);
    });
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
