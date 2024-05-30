
import mongoose from 'mongoose';
import { UserSummary, DirectMessages } from '../database/database.js';
import getOrSetCache, {/*setUpdateIdCache,*/ setCacheAndReturn, setCache} from '../database/getOrSetCache.js';
import decodeJwt from '../universal-scripts/jwt-decode.js';
import { getDirectMessagesIncrement } from '../direct-message-scripts/get-user-channel.js';

export default async function createDirectMessageAndAddToUsers(user1, user2, seq=0, initialMessage = null) {
    try {
      const existingChannel = await getExistingChannel();
      async function getExistingChannel() {
        let totalValue = parseInt(seq, 10) + getDirectMessagesIncrement; 
        let directMessages = await DirectMessages.findOne({
          users: { $all: [user1, user2] }
        }, {
          messages: { $slice: -( totalValue ) }
        })
        
        if(!directMessages) return null;
        directMessages.messages = directMessages.messages.slice(0, directMessages.messages.length - seq);
        
        const isLast = directMessages.messages.length < getDirectMessagesIncrement;
    
        const relevantProperties = {
          _id: directMessages._id,
          messages: directMessages.messages,
          users: directMessages.users,
          preferredName: directMessages.preferredName,
          channelName: directMessages.channelName,
          timestamp: directMessages.timestamp,
          last: isLast,
          seq: seq
        };
        
        return relevantProperties;
      };

      if (existingChannel) {
          return existingChannel;
      }
      const user1UserSummary = await getOrSetCache(`userSummary:${user1}`, async () => {
        return await UserSummary.findOne({ username: user1 });
      });
      const user2UserSummary = await getOrSetCache(`userSummary:${user2}`, async () => {
        return await UserSummary.findOne({ username: user2});
      });
      const directMessageData = {
        _id: new mongoose.Types.ObjectId(),
        users: [user1, user2],
        preferredName: [user1UserSummary.preferredName,user2UserSummary.preferredName],
        channelName: `Direct between ${user1} & ${user2}`,
        timestamp: new Date().toISOString(),
      };
  
      if (initialMessage) {
        directMessageData.messages = [initialMessage];
      }
      
      const directMessage = new DirectMessages(directMessageData);
      await directMessage.save();

      await setCache(`userSummary:${user1}`, async() => {
        const updatedUserSummary = await UserSummary.findOneAndUpdate(
          { username: user1 },
          {
            $push: {
              directChannels: {
                users: [user1, user2],
                preferredName: [user1UserSummary.preferredName,user2UserSummary.preferredName],
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
        }
      });
      await setCache(`userSummary:${user2}`, async() => {
        const updatedUserSummary = await UserSummary.findOneAndUpdate(
          { username: user2 },
          {
            $push: {
              directChannels: {
                users: [user1, user2],
                preferredName: [user1UserSummary.preferredName,user2UserSummary.preferredName],
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
        }
      });
      return directMessage;
    } catch (error) {
      console.error("Error creating direct message channel:", error);
    }
  }

  export async function getDirectChannelForUser(req,res){
    const {username} = decodeJwt(req.headers.authorization);
    const sequenceNumber = req.headers['sequence-number'];
    const requestedUsername = req.params.username;
    let returnedVal = await createDirectMessageAndAddToUsers(username,requestedUsername,sequenceNumber);


    return res.json(returnedVal);
  }