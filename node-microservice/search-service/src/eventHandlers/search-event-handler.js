const SearchPost = require("../models/Search");
const logger = require("../utils/logger");

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
    await SearchPost.findOneAndDelete(event.postId);
    logger.info(`Search Post deleted successfully`);
  } catch (error) {
    logger.error(`Error delete search post ${error}`);
  }
}

module.exports = { handleSearchPost, handlePostDelete };
