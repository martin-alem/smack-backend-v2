import { createClient } from "redis";

async function configRedis() {
  try {
    const redisClient = createClient();
    redisClient.on("error", (error: any) => console.error(error));
      await redisClient.connect()
      console.log( "connected to redis" );
      return redisClient;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export default configRedis;
