
import mongoose from 'mongoose';
import { UserSummary, DirectMessages } from '../database/database.js';
import getOrSetCache, {setUpdateIdCache, setCacheAndReturn, setCache} from '../database/getOrSetCache.js';
import decodeJwt from '../universal-scripts/jwt-decode.js';

export default async function createDirectMessageAndAddToUsers(user1, user2, initialMessage = null) {
    try {
      const existingChannel = await setUpdateIdCache(async () => await DirectMessages.findOne({
        users: { $all: [user1, user2] }
      }, {
        messages: { $slice: [10, 10] }  // Start at the 11th item (index 10) and return 10 items
      }));
      console.log('start hi')
      console.log(existingChannel)
      console.log('end hi')

      if (existingChannel) {
          console.log("Direct message channel already exists between these users.");
          return existingChannel;
      }
      const directMessageData = {
        _id: new mongoose.Types.ObjectId(),
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
      return directMessage;
    } catch (error) {
      console.error("Error creating direct message channel:", error);
    }
  }

  export async function getDirectChannelForUser(req,res){
    const {username} = decodeJwt(req.headers.authorization);
    const requestedUsername = req.params.username;
    let returnedVal = await createDirectMessageAndAddToUsers(username,requestedUsername);
    console.log('start debug pro')
    console.log(returnedVal)
    console.log('end debug pro')
    return res.json(returnedVal);
  }