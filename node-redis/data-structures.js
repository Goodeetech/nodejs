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

    const extractAllNotes = await client.lRange("notes", 0, -1);
    console.log(extractAllNotes);
    const firstNote = await client.lPop("notes");
    console.log(firstNote);

    //SETS => SADD, SMEMBERS, SISMEMBER, SREM
    await client.sAdd("user:nicknames", ["john", "Goodee", "xyz"]);
    const extractNickNames = await client.sMembers("user:nicknames");
    console.log(extractNickNames);

    const isGoodeeMember = await client.sIsMember("user:nicknames", "Good");
    console.log(isGoodeeMember);

    await client.sRem("user:nicknames", "Goodee");
    const updatedNickNames = await client.sMembers("user:nicknames");
    console.log(updatedNickNames);
  } catch (error) {
    console.error(error);
  } finally {
    await client.quit();
  }
}

redisDataStructure();
