import Redis from "ioredis";

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    redisInstance = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });
    redisInstance.on("error", (err) => {
      console.error("Redis error:", err.message);
    });
  }
  return redisInstance;
}

export async function publishEvent(channel: string, data: unknown) {
  const redis = getRedis();
  await redis.publish(channel, JSON.stringify(data));
}

export async function streamAdd(
  streamKey: string,
  fields: Record<string, string>,
  maxlen?: number
) {
  const redis = getRedis();
  const args: (string | number)[] = [streamKey, "*"];
  for (const [k, v] of Object.entries(fields)) {
    args.push(k, v);
  }
  if (maxlen) {
    args.unshift("MAXLEN", "~", maxlen);
  }
  return redis.xadd(...(args as [string, ...string[]]));
}

export async function streamReadGroup(
  streamKey: string,
  group: string,
  consumer: string,
  count = 10,
  blockMs = 2000
) {
  const redis = getRedis();
  return redis.xreadgroup(
    "GROUP",
    group,
    consumer,
    "COUNT",
    count,
    "BLOCK",
    blockMs,
    "STREAMS",
    streamKey,
    ">"
  );
}
