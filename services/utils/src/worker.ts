import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { sendMail } from "./consumer.js";

const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

console.log("Starting email worker...");

export const worker = new Worker(
  "email",
  async (job) => {
    if (job.name === "forgot-password") {
      console.log("Processing forgot-password job:", job.data);
      await sendMail(job.data);
    } else if (job.name === "STATUS-UPDATION") {
      await sendMail(job.data);
    }
  },
  { connection },
);
worker.on("ready", () => {
  console.log("✅ Worker is ready");
});

worker.on("active", (job) => {
  console.log(`🚀 Processing job ${job.id}`);
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

worker.on("error", (err) => {
  console.error("❌ Worker error:", err);
});
