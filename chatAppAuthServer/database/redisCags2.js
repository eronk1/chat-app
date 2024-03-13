import { redisClient } from "../auth.js";
import 'dotenv/config.js'

export async function getOrRefreshCheckSetCache(key, cb) {
    try {
        const data = await redisClient.get(key);
        if (data != null) {
            console.log('Cache hit');
            return JSON.parse(data);
        }

        console.log('Cache miss');
        const freshData = await cb();
        if(!freshData) return null;
        await redisClient.set(key, JSON.stringify(freshData), {
            EX: parseInt(process.env.REFRESH_TOKEN_EXPIRATION_TIME*3600, 10),
        });
        return freshData;
    } catch (error) {
        console.error('Error accessing Redis:', error);
        throw error;
    }
}
export async function getOrSetCache(key, cb) {
    try {
        const data = await redisClient.get(key);
        if (data != null) {
            console.log('Cache hit');
            return JSON.parse(data);
        }

        console.log('Cache miss');
        const freshData = await cb();
        if(!freshData) return null;
        await redisClient.set(key, JSON.stringify(freshData), {
            EX: parseInt(1800, 10),
        });
        return freshData;
    } catch (error) {
        console.error('Error accessing Redis:', error);
        throw error;
    }
}
export async function setCacheRefreshDB(key, cb) {
    try {
        const freshData = await cb();
        
        await redisClient.set(key, JSON.stringify(freshData), {
            EX: parseInt(1800, 10),
        });
    } catch (error) {
        console.error('Error accessing Redis:', error);
        throw error;
    }
}
export async function deleteCacheRefreshDB(key, cb) {
    try {
        await cb();
        await redisClient.del(key);
    } catch (error) {
        console.error('Error accessing Redis:', error);
        throw error;
    }
}
export async function updateKeyExpiration(key, cb) {
    try {
      // Check if the key exists
      const exists = await redisClient.exists(key);
      let freshData = await cb();
      if (exists) {
        await redisClient.expire(key, process.env.REFRESH_TOKEN_EXPIRATION_TIME*3600);
      } else {
        await redisClient.set(key, JSON.stringify(freshData), {
            EX: parseInt(process.env.REFRESH_TOKEN_EXPIRATION_TIME*3600, 10),
        });
      }
    } catch (error) {
      console.error('Error updating key expiration:', error);
    }
  }