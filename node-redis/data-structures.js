const redis = require("redis");

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

//event listener

client.on("error", (error) => {
  console.log("Redis client error occured", error);
});

async function redisDataStructure() {
  try {
    await client.connect();
    console.log("Redis server connected successfully");
    //Strings => SET, GET, MSET, MGET
    await client.set("user:name", "Hassan Goodness");
    const name = await client.get("user:name");
    console.log(name);

    await client.mSet([
      "user:email",
      "goodee@gmail.com",
      "user:age",
      "60",
      "user:country",
      "Nigeria",
    ]);

    const [email, age, country] = await client.mGet([
      "user:name",
      "user:age",
      "user:country",
    ]);

    console.log(email, age, country);

    //LIST => LPUSH, RPUSH, LRANGE, LPOP, RPOP
    // await client.lPush("notes", ["note 1", "note 2", "note 3", "note 4"]);

    // const extractAllNotes = await client.lRange("notes", 0, -1);
    // console.log(extractAllNotes);
    // const firstNote = await client.lPop("notes");
    // console.log(firstNote);

    // //SETS => SADD, SMEMBERS, SISMEMBER, SREM
    // await client.sAdd("user:nicknames", ["john", "Goodee", "xyz"]);
    // const extractNickNames = await client.sMembers("user:nicknames");
    // console.log(extractNickNames);

    // const isGoodeeMember = await client.sIsMember("user:nicknames", "Good");
    // console.log(isGoodeeMember);

    // await client.sRem("user:nicknames", "Goodee");
    // const updatedNickNames = await client.sMembers("user:nicknames");
    // console.log(updatedNickNames);

    // SORTED SET => ZADD, ZRANGE, ZREM, ZSCORE,ZRANK

    // await client.zAdd("cart", [
    //   {
    //     score: 1,
    //     value: "apple",
    //   },
    //   {
    //     score: 3,
    //     value: "banana",
    //   },
    //   {
    //     score: 2,
    //     value: "orange",
    //   },
    // ]);

    // const getCartItems = await client.zRange("cart", 0, -1);

    // console.log(getCartItems);

    // const extractAllItemsWithScores = await client.zRangeWithScores(
    //   "cart",
    //   0,
    //   -1
    // );
    // console.log(extractAllItemsWithScores);

    // const getRank = await client.zRank("cart", "banana");
    // console.log(getRank);

    //HASHES => HSET, HGET, HGETALL, HDEL

    await client.hSet("product:1", {
      name: "product 1",
      description: "product one description",
      rating: "5",
    });

    const getProductRating = await client.hGet("product:1", "rating");
    console.log(getProductRating);

    const getProductDesc = await client.hGetAll("product:1");
    console.log(getProductDesc);

    await client.hDel("product:1", "rating");
    const getAllProducts = await client.hGetAll("product:1");
    console.log(getAllProducts);
  } catch (error) {
    console.error(error);
  } finally {
    await client.quit();
  }
}

redisDataStructure();
