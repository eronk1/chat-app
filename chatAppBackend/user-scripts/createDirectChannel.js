
import mongoose from 'mongoose';
import { UserSummary, DirectMessages } from '../database/database.js';
import getOrSetCache, {setUpdateIdCache, setCacheAndReturn} from '../database/getOrSetCache.js';

export default async function createDirectMessageAndAddToUsers(user1, user2, initialMessage = null) {
    try {
      const existingChannel = await setUpdateIdCache(async () => await DirectMessages.findOne({
          groupMessage: false,
          users: { $all: [user1, user2] }
      }));
      const existingChannel2 = await setUpdateIdCache(async () => await DirectMessages.findOne({
        groupMessage: false,
        users: { $all: [user1, user2] }
    }));

      if (existingChannel || existingChannel2) {
          console.log("Direct message channel already exists between these users.");
          return;
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
      
      const directMessage = await setCacheAndReturn(`directMessages:${directMessageData._id}`,async()=>{
        const gonnaSaveDirect = new DirectMessages(directMessageData);
        await gonnaSaveDirect.save();
        return gonnaSaveDirect;
      })
      await setCache(`userSummary:${user1}`, async() => {
        const updatedUserSummary = await UserSummary.findOneAndUpdate(
          { username: user1 },
          {
            $push: {
              directChannels: {
                users: [user1, user2],
                _id: directMessage._id.toString(),
              },
            },
          },
          {
            new: true, 
            upsert: false 
          }
        );
    
        if (updatedUserSummary) {
          return updatedUserSummary;
        } else {
          console.log('No document found with the specified criteria.');
        }
      });
      await setCache(`userSummary:${user2}`, async() => {
        const updatedUserSummary = await UserSummary.findOneAndUpdate(
          { username: user2 },
          {
            $push: {
              directChannels: {
                users: [user1, user2],
                _id: directMessage._id.toString(),
              },
            },
          },
          {
            new: true, 
            upsert: false 
          }
        );
    
        if (updatedUserSummary) {
          return updatedUserSummary;
        } else {
          console.log('No document found with the specified criteria.');
        }
      });
  
      console.log("Direct message channel created and added to users successfully.");
    } catch (error) {
      console.error("Error creating direct message channel:", error);
    }
  }