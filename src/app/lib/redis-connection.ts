import { Redis } from 'ioredis';

const connection = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,

    maxRetriesPerRequest: null,
});

export  {connection};

