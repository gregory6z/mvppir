/**
 * Redis Configuration for BullMQ
 *
 * Single Redis connection shared across all queues and workers.
 */

import IORedis from "ioredis";
import { env } from "@/config/env";

// Create Redis connection
export const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
});

// Handle connection events
redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (error) => {
  console.error("❌ Redis connection error:", error);
});

redis.on("close", () => {
  console.log("⚠️  Redis connection closed");
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await redis.quit();
});

process.on("SIGINT", async () => {
  await redis.quit();
});
