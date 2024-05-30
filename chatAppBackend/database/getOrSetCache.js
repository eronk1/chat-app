import 'dotenv/config.js';
import Redis from 'redis'
import { DirectMessages } from './database.js';
import { redisClient } from '../server.js';
import { getDirectMessagesIncrement } from '../direct-message-scripts/get-user-channel.js';
export default async function getOrSetCache(key, cb) {
    try {
        const data = await redisClient.get(key);
        if (data != null) {
            return JSON.parse(data);
        }

        const freshData = await cb();
        if(!freshData){
            return null;
        }
        await redisClient.set(key, JSON.stringify(freshData), {
            EX: parseInt(process.env.REDIS_CACHE_EXPIRATION_TIME, 10),
        });
        return freshData;
    } catch (error) {
        console.error('Error accessing Redis:1', error);
        throw error;
    }
}
export async function getOrSetCacheSpecial(key, cb) {
    try {
        const data = await redisClient.get(key);
        if (data != null) {
            return JSON.parse(data);
        } else {
            const freshData = await cb();
            if (freshData) {
                await redisClient.set(key, JSON.stringify(freshData), {
                    EX: parseInt(process.env.REDIS_CACHE_EXPIRATION_TIME, 10),
                });
                return freshData;
            } else {
                return null;
            }
        }
    } catch (error) {
        console.error('Error accessing Redis:2', error);
        throw error;
    }
}
export async function setCache(key, cb, checkFail = false) {
    try {
        const freshData = await cb();
        if(!freshData){
            checkFail = true;
            return;
        }
        await redisClient.set(key, JSON.stringify(freshData), {
            EX: parseInt(process.env.REDIS_CACHE_EXPIRATION_TIME, 10),
        });
    } catch (error) {
        console.error('Error accessing Redis:3', error);
        throw error;
    }
}

export async function setCacheAndReturn(key, cb) {
    try {
        const freshData = await cb();
        await redisClient.set(key, JSON.stringify(freshData), {
            EX: parseInt(process.env.REDIS_CACHE_EXPIRATION_TIME, 10),
        });
        return freshData;
    } catch (error) {
        console.error('Error accessing Redis:4', error);
        throw error;
    }
}

export async function setCacheDirectAndReturn(key, cb, channelId) {
    try {
        const message = await cb();
        let freshData;
        const channelData = await redisClient.get(key);
        if (channelData != null) {
            let val = JSON.parse(channelData);
            freshData = {
                ...val,
                messages: [...val.messages, message]
            };
        }else{
            freshData = await DirectMessages.findOne(
                { _id: channelId },
                { messages: { $slice: -getDirectMessagesIncrement } }
            );
        }
        await redisClient.set(key, JSON.stringify(freshData), {
            EX: parseInt(process.env.REDIS_CACHE_EXPIRATION_TIME, 10),
        });
        return freshData;
    } catch (error) {
        console.error('Error accessing Redis:5', error);
        throw error;
    }
}

// export async function setUpdateIdCache(cb) {
//     try {
//         const freshData = await cb();
//         if(!freshData) return null;
//         await redisClient.set(`directMessages:${freshData._id}${freshData.seq}}`, JSON.stringify(freshData), {
//             EX: parseInt(process.env.REDIS_CACHE_EXPIRATION_TIME, 10),
//         });
//         return freshData;
//     } catch (error) {
//         console.error('Error accessing Redis:6', error);
//         throw error;
//     }
// }
