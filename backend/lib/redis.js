// // "redis.js"
// import dotenv from 'dotenv';
// import Redis from "ioredis"

// dotenv.config();


// const redis = new Redis(process.env.UPSTASH_REDIS_URL);

// export default redis;


import dotenv from 'dotenv';
import Redis from "ioredis";

dotenv.config();

// Initialize the Redis client with improved options
const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
    retryStrategy: (times) => {
        // Try reconnecting after a delay based on retry attempts (exponential backoff)
        const delay = Math.min(times * 50, 2000); // Max delay is 2 seconds
        console.log(`Retrying Redis connection attempt #${times}, retrying in ${delay}ms...`);
        return delay;
    },
    reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNRESET'];
        if (targetErrors.some(error => err.message.includes(error))) {
            console.error(`Reconnecting to Redis due to error: ${err.message}`);
            return true; // Attempt reconnection
        }
        return false; // Do not reconnect for other errors
    },
    maxRetriesPerRequest: null, // Disable max retries per request for long-running commands
    connectTimeout: 10000, // Timeout after 10 seconds
});

// Event listeners for monitoring Redis connection states
redis.on('connect', () => {
    console.log('Redis connection established successfully.');
});

redis.on('ready', () => {
    console.log('Redis client is ready to receive commands.');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redis.on('close', () => {
    console.log('Redis connection has been closed.');
});

redis.on('reconnecting', () => {
    console.log('Attempting to reconnect to Redis...');
});

redis.on('end', () => {
    console.log('Redis connection has ended.');
});

export default redis;
