import dotenv from "dotenv";
import { Redis } from "ioredis";

dotenv.config();

// Redis client for normal operations (cache, sessions, etc.)
export const connection = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});
