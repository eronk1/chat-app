
import mongoose from 'mongoose';
import { UserSummary, DirectMessages } from '../database/database.js';

export default async function createDirectMessageAndAddToUsers(user1, user2, initialMessage = null) {
    try {
      const existingChannel = await DirectMessages.findOne({
          groupMessage: false,
          users: { $all: [user1, user2] }
      });
      const existingChannel2 = await DirectMessages.findOne({
        groupMessage: false,
        users: { $all: [user2, user1] }
    });

      if (existingChannel || existingChannel2) {
          console.log("Direct message channel already exists between these users.");
          return; // Exit the function if the channel exists
      }
      const directMessageData = {
        _id: new mongoose.Types.ObjectId(),
        groupMessage: false,
        users: [user1, user2],
        channelName: `Direct between ${user1} & ${user2}`,
        timestamp: new Date().toISOString(),
      };
  
      if (initialMessage) {
        directMessageData.messages = [initialMessage];
      }
  
      const directMessage = new DirectMessages(directMessageData);
  
      await directMessage.save();
  
      await UserSummary.updateOne(
        { username: user1 },
        { $push: { directChannels: { users: [user1, user2], _id: directMessage._id.toString() } } }
      );
      await UserSummary.updateOne(
        { username: user2 },
        { $push: { directChannels: { users: [user1, user2], _id: directMessage._id.toString() } } }
      );
  
      console.log("Direct message channel created and added to users successfully.");
    } catch (error) {
      console.error("Error creating direct message channel:", error);
    }
  }