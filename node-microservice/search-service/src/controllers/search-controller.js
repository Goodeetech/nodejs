const SearchPost = require("../models/Search");
const logger = require("../utils/logger");

const searchPostController = async (req, res) => {
  logger.info(`Search endpoint hit`);

  try {
    const { query } = req.query;
    const cachedKey = `search:${query}`;
    const cachedSearch = await req.redisClient.get(cachedKey);

    if (cachedSearch) {
      return res.json(JSON.parse(cachedSearch));
    }
    const result = await SearchPost.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
    if (!query) {
      return res.status(400).json({
        message: "Query must be given!",
        success: false,
      });
    }
    //store in redis
    await req.redisClient.setex(cachedKey, 60, JSON.stringify(result));

    return res.status(200).json({
      message: "Query gotten successfully",
      success: true,
      result,
    });
  } catch (error) {
    logger.error(`Error occurred while searching post`);
    return res.status(500).json({
      message: "An error occurred while searching posts",
      success: false,
    });
  }
};

module.exports = searchPostController;
