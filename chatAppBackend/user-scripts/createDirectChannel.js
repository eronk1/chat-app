
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
        console.log('value total',totalValue)
        let directMessages = await DirectMessages.findOne({
          users: { $all: [user1, user2] }
        }, {
          messages: { $slice: -( totalValue ) }
        })
        console.log('value total',totalValue)
        
        
        directMessages.messages = directMessages.messages.slice(0, directMessages.messages.length - seq);
        
        const isLast = directMessages.messages.length < getDirectMessagesIncrement;
    
        const relevantProperties = {
          _id: directMessages._id,
          messages: directMessages.messages,
          users: directMessages.users,
          channelName: directMessages.channelName,
          timestamp: directMessages.timestamp,
          last: isLast,
          seq: seq
        };
        
        return relevantProperties;
      };

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
      
      const directMessage = new DirectMessages(directMessageData);
      await directMessage.save();

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
    const sequenceNumber = req.headers['sequence-number'];
    console.log(sequenceNumber)
    console.log('seqnum')
    const requestedUsername = req.params.username;
    let returnedVal = await createDirectMessageAndAddToUsers(username,requestedUsername,sequenceNumber);
    console.log('start debug pro')
    
    console.log(returnedVal.last)
    console.log(returnedVal)
    console.log('end debug pro')

    return res.json(returnedVal);
  }