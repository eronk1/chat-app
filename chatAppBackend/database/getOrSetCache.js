import 'dotenv/config.js';
import Redis from 'redis'
import { DirectMessages } from './database.js';
import { redisClient } from '../server.js';
import { getDirectMessagesIncrement } from '../direct-message-scripts/get-user-channel.js';
export default async function getOrSetCache(key, cb) {
    try {
        console.log(key)
        const data = await redisClient.get(key);
        if (data != null) {
            console.log('Cache hit');
            return JSON.parse(data);
        }

        console.log('Cache miss');
        const freshData = await cb();
        console.log(freshData)
        if(!freshData){
            return null;
        }
        console.log(freshData)
        console.log('--start-debug')
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
            console.log('Cache hit');
            return JSON.parse(data);
        } else {
            console.log('Cache miss');
            const freshData = await cb();
            if (freshData) {
                await redisClient.set(key, JSON.stringify(freshData), {
                    EX: parseInt(process.env.REDIS_CACHE_EXPIRATION_TIME, 10),
                });
                return freshData;
            } else {
                console.log('No data received from callback function');
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
            console.log('Cache hit');
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
