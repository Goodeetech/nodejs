const redis = require("redis");
// pub-sub => publisher publish a message => the client consumes
const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

client.on("error", (error) => {
  console.log("Redis client error occurred", error);
});

async function connectRedisAndCode() {
  try {
    await client.connect();
    const subscriber = client.duplicate(); // create a new client => shares the same connection
    await subscriber.connect();
    await subscriber.subscribe("dummy-channel", (channel, message) =>
      console.log(`Received message from ${channel} : ${message}`)
    );
    await client.publish("dummy-channel", "Some dummy dat from publisher");
    await client.publish(
      "dummy-channel",
      "Some new dummy data just sent from the pulisher"
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await subscriber.unsubscribe("dummy-channel");
    await subscriber.quit(); //quit/close subscribers connection

    // pipelining and transactions
    const multi = client.multi();
    multi.set("key-transaction1", "value1");
    multi.set("key-transaction2", "value2");
    multi.get("key-transaction1");
    multi.get("key-transaction2");
    const result = await multi.exec();
    console.log(result);

    const pipeline = client.multi();
    pipeline.set("key-pipeline1", "value1");
    pipeline.set("key-pipeline2", "value2");
    pipeline.get("key-pipeline1");
    pipeline.get("key-pipeline2");
    const pipelineResult = await multi.exec();
    console.log(pipelineResult);

    //batch data operation
    const pipelineOne = client.multi();

    //another examples
    const dummyData = client.multi();
    dummyData.decrBy("account:1234", 100);
    dummyData.incrBy("account:000", 100);
    const finalResult = await dummyData.exec();
    console.log(finalResult);

    console.log("checking performance");

    console.time("without pipelining");
    for (i = 0; i < 1000; i++) {
      client.set(`user ${i}:action`, `Action ${i}`);
    }

    console.timeEnd("without pipelining");

    console.time("with pipelining");
    for (i = 0; i < 1000; i++) {
      pipelineOne.set(`user ${i}:action`, `Action ${i}`);
    }

    await pipelineOne.exec();
    console.timeEnd("with pipelining");
  } catch (error) {
    console.error(error);
  } finally {
    client.quit();
  }
}

connectRedisAndCode();
