const { parse } = require("dotenv");
const Post = require("../models/post");
const logger = require("../utils/logger");
const validatePost = require("../utils/validatePost");
const { publishEvent } = require("../utils/rabbitmq");

// async function (req, input) {
//   const keys = await req.redisClient.keys("posts:*");
//   if (keys.length > 0) {
//     await req.redisClient.del(keys);
//   }
// }
async function invalidatePostCache(req, input) {
  let cursor = "0";
  do {
    // SCAN cursor MATCH pattern COUNT batchSize
    const result = await req.redisClient.scan(
      cursor,
      "MATCH",
      "posts:*",
      "COUNT",
      100
    );
    cursor = result[0];
    const keys = result[1];

    if (keys.length > 0) {
      await req.redisClient.del(...keys);
    }
  } while (cursor !== "0");
}

// async function invalidateSinglePostCache(req, input) {
//   const key = await req.redisClient.keys(`post:${input}`);
//   if (key.length > 0) {
//     await req.redisClient.del(key);
//   }
// }

async function invalidateSinglePostCache(req, input) {
  let cursor = "0";

  do {
    const [newCursor, keys] = await req.redisClient.scan(
      cursor,
      "MATCH",
      `post:${input}`,
      "COUNT",
      100
    );

    cursor = newCursor;

    if (keys.length > 0) {
      await req.redisClient.del(...keys);
    }
  } while (cursor !== "0");
}

const createPost = async (req, res) => {
  logger.warn(`API hit create post endpoint`);
  try {
    const { error } = validatePost(req.body);
    if (error) {
      logger.warn(`Validation error: ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = req.body;

    if (!content) {
      logger.warn("Content of the post is missing");
      return res.status(400).json({
        message: "Content must be defined",
        success: false,
      });
    }
    const newlyCreatedPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();
    await invalidatePostCache(req, newlyCreatedPost._id.toString());
    logger.info("Post created successfully");
    return res.status(201).json({
      success: true,
      message: "Post created successfully",
    });
  } catch (error) {
    logger.error(`Error occurred while creating post`);
    return res.status(500).json({
      message: "An error occurred while creating post",
      success: false,
    });
  }
};

const getAllPosts = async (req, res) => {
  logger.warn(`API hit get all posts endpoint`);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    const total = await Post.countDocuments();
    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPost: total,
    };

    //save in cache
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
    return res.status(200).json({
      result,
      success: true,
    });
  } catch (error) {
    logger.error(`Error occurred while getting all posts`);
    return res.status(500).json({
      message: "An error occurred while getting all posts",
      success: false,
    });
  }
};

const getSinglePost = async (req, res) => {
  logger.warn(`API hit get single post endpoint`);
  try {
    const postId = req.params.id;
    const cachedKey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cachedKey);
    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }

    const singlePost = await Post.findById(postId);

    if (!singlePost) {
      logger.warn(`Post with ID ${postId}not found`);
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }
    //save in cache
    await req.redisClient.setex(cachedKey, 3600, JSON.stringify(singlePost));

    return res.status(200).json({
      message: "Post gotten successfully",
      success: true,
      data: singlePost,
    });
  } catch (error) {
    logger.error(`Error occurred while getting single post`);
    return res.status(500).json({
      message: "An error occurred while getting single posts",
      success: false,
    });
  }
};

const deletePost = async (req, res) => {
  logger.warn(`API hit get delete post endpoint`);
  try {
    const id = req.params.id;
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      logger.warn(`Couldn't find the post with this ID`);
      return res.status(400).json({
        message: "Post couldn't be deleted, Provide post with real ID",
        success: false,
      });
    }

    // publish event to RabbitMQ
    await publishEvent("post.deleted", {
      postId: deletedPost._id.toString(),
      userId: req.user.userId,
      mediaIds: deletePost.mediaIds,
    });

    await invalidateSinglePostCache(req, id);
    await invalidatePostCache(req);
    return res.status(200).json({
      message: "Post deleted successfully",
      success: true,
    });
  } catch (error) {
    logger.error(`Error occurred while deleting single post`);
    return res.status(500).json({
      message: "An error occurred while deleting single posts",
      success: false,
    });
  }
};

module.exports = { createPost, getAllPosts, getSinglePost, deletePost };
