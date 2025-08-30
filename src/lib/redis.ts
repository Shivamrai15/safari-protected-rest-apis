import { createClient } from 'redis';

export const redis = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD || '',
    socket: {
        host: process.env.REDIS_URL || 'localhost',
        port: 11114
    }
});

redis.on("error", (err) => console.error("Redis Client Error", err));