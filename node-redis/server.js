const redis = require("redis");

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

//event listener

client.on("error", (error) => {
  console.log("Redis client error occured", error);
});

async function testRedisConnection() {
  try {
    await client.connect();
    console.log("Redis server connected successfully");

    await client.set("name", "Goodee");

    const extractValue = await client.get("name");
    console.log(extractValue);
    const deletedCount = await client.del("name");
    console.log(deletedCount);

    const updatedValue = await client.get("name");
    console.log(updatedValue);

    await client.set("count", "100");
    const incrementedValue = await client.incr("count");
    console.log(incrementedValue);
    const decrementedValue = await client.decr("count");

    console.log(decrementedValue);
  } catch (error) {
    console.log(error);
  } finally {
    await client.quit();
  }
}

testRedisConnection();
