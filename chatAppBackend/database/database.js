import "dotenv/config.js";
import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const messageSchema = new mongoose.Schema({
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      required: true
    }
  });
  // user direct messages
  const directMessageSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    users: {
      type: [String],
      required: true
    },
    channelName: String,
    timestamp: {
      type: String,
      required: true
    },
    messages: [messageSchema] // Embedding message schema
  });

  const groupMessageSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    users: {
      type: [String],
      required: true
    },
    channelName: String,
    timestamp: {
      type: String,
      required: true
    },
    messages: [messageSchema] // Embedding message schema
  });




// server schema
const channelSchema = new Schema({
    channelCategory: { type: String, default: 'none' },
    channelName: String,
    _id: Schema.Types.ObjectId, 
    messages: [messageSchema],
    channelAccess: { type: [String], default: ['everyone'] } // who has access to this channel
});

const changeSchema = new Schema({
    change: [String] // This will store an array of strings, first being type, second being message
});

const serverMessageSchema = new Schema({
    _id: Schema.Types.ObjectId, 
    users: [String],
    serverName: String,
    channels: [channelSchema],
    timestamp: String,
    changes: [changeSchema]
});




// user data summary
const directChannelSchema = new Schema({
    users: [String],
    _id: String
  });
const groupChannelSchema = new Schema({
    channelName: {
      type: String,
      required: true
    },
    _id: String,
    members: {
      type: Number,
      required: true
    }
  });
  
  const serverChannelSchema = new Schema({
    channelName: {
      type: String,
      required: true
    },
    _id: String,
  });
  
  const friendSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    _id: String
  });
  
  const userSummary = new Schema({
    username: {
      type: String,
      required: true
    },
    preferredName: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: true
    },
    age: {
      day: Number,
      month: Number,
      year: Number
    },
    directChannels: [directChannelSchema],
    groupChannels: [groupChannelSchema],
    ServerChannels: [serverChannelSchema],
    friends: [friendSchema],
    friendPending: [String],
    friendRequest: [String]
  });


export const UserSummary = mongoose.model('user-summary', userSummary);
export const DirectMessages = mongoose.model('direct-messages', directMessageSchema);
export const GroupMessages = mongoose.model('group-messages', groupMessageSchema);
export const ServerMessages = mongoose.model('server-messages',serverMessageSchema);