import "dotenv/config.js";
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema =  new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
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
    preferredName: {
        type: String,
        required: true
    }
}, {timestamps: true});

const refreshTokenSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        index: { expires: '59m' }
    }
}, { timestamps: true });

// Create the model from the schema
export const User = mongoose.model('users', userSchema);
export const refreshToken = mongoose.model('refreshTokens',refreshTokenSchema);