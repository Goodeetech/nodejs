const SearchPost = require("../models/Search");
const logger = require("../utils/logger");
const Redis = require("ioredis");

const redisClient = new Redis(process.env.REDIS_URL);
async function handleSearchPost(event) {
  try {
    const newSearchPost = new SearchPost({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
      createdAt: event.createdAt,
    });

    if (!newSearchPost) {
      logger.info(`Search info missing`);
    }

    await newSearchPost.save();
    logger.info(
      `Search post saved successfully ${
        event.postId
      }  ${newSearchPost._id.toString()}`
    );
  } catch (error) {
    logger.error(`Error getting the search post`, error);
  }
}

async function handlePostDelete(event) {
  try {
    // await SearchPost.findOneAndDelete({ postId: event.postId });
    // logger.info(`Search Post deleted successfully`);

    const postInSearchPost = await SearchPost.findOne({ postId: event.postId });
    if (!postInSearchPost) {
      logger.warn(`Post not found for deletion: ${event.postId}`);
      return;
    }
    await postInSearchPost.deleteOne({ postId: event.postId });

    //Now to invalidate the cached post if the deleted post has any of the cached
    const normalized = postInSearchPost.content.toLowerCase().trim();
    let keywords = normalized.split(/\s+/);

    const stopWords = new Set([
      "the",
      "and",
      "is",
      "a",
      "an",
      "of",
      "to",
      "in",
      "on",
      "for",
      "with",
    ]);
    keywords = keywords.filter(
      (word) => !stopWords.has(word) && word.length > 1
    );
    keywords = [...new Set(keywords)];

    const deletePromises = keywords.map(async (keyword) => {
      const searchKey = `search:${keyword}`;
      const exists = await redisClient.exists(searchKey);
      if (exists) {
        await redisClient.del(searchKey);
        logger.info(`Invalidated cache for :${keyword}`);
      }
    });
    await Promise.all(deletePromises);
  } catch (error) {
    logger.error(`Error delete search post ${error}`);
  }
}

async function handleInvalidateCache(event) {
  try {
    const { content } = event;
    if (!content) return;

    // Step 1: Normalize text (lowercase, trim)
    const normalized = content.toLowerCase().trim();

    // Step 2: Split into words (simple split on spaces)
    let keywords = normalized.split(/\s+/);

    // Step 3: Remove very common stop words to avoid useless invalidations
    const stopWords = new Set([
      "the",
      "and",
      "is",
      "a",
      "an",
      "of",
      "to",
      "in",
      "on",
      "for",
      "with",
    ]);
    keywords = keywords.filter(
      (word) => !stopWords.has(word) && word.length > 1
    );

    // Step 4: Make keywords unique to avoid double work
    keywords = [...new Set(keywords)];

    // Step 5: Loop through each keyword and invalidate matching cache
    // for (const keyword of keywords) {
    //   const searchKey = `search:${keyword}`;
    //   const exists = await req.redisClient.exists(searchKey);
    //   if (exists) {
    //     await req.redisClient.del(searchKey);
    //     console.log(`Invalidated cache for: ${searchKey}`);
    //   }
    // }

    const deletePromises = keywords.map(async (keyword) => {
      const searchKey = `search:${keyword}`;
      const exists = await redisClient.exists(searchKey);

      if (exists) {
        await redisClient.del(searchKey);
        logger.info(`invalidated cache for :${searchKey}`);
      }
    });
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error invalidating search cache:", error);
  }
}

module.exports = { handleSearchPost, handlePostDelete, handleInvalidateCache };
