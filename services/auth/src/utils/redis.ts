import { Redis } from "ioredis";

export const connection = new Redis(process.env.REDIS_URL!);

connection.on("connect", () => {
  console.log("Redis connected");
});

connection.on("error", (err) => {
  console.error(err);
});
