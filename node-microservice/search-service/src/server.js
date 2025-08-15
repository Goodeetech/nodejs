require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const connectDB = require("./database/db");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");

const searchRoute = require("./routes/search-route");
const {
  handleSearchPost,
  handlePostDelete,
  handleInvalidateCache,
} = require("./eventHandlers/search-event-handler");

const app = express();
const PORT = process.env.PORT || 3004;
// Connect to MongoDB

connectDB();

const redisClient = new Redis(process.env.REDIS_URL);

// Express App

// Security Middlewares
app.use(express.json());
app.use(helmet());
app.use(cors()); // ✅ FIXED: you were using cors (function) without invoking it

// Request Logger
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  if (Object.keys(req.body || {}).length > 0) {
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
  }
  next();
});

app.use(
  "/api/search",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  searchRoute
);
app.use(errorHandler);
async function startServer() {
  try {
    await connectToRabbitMQ();

    //consume event from post.created

    await Promise.all([
      consumeEvent("post.created", handleSearchPost),
      consumeEvent("post.created", handleInvalidateCache),
    ]);
    await consumeEvent("post.deleted", handlePostDelete);

    app.listen(PORT, () => {
      logger.info(`Server is listening on port: ${PORT}`);
    });
  } catch (error) {
    logger.error(`Error connecting to the server of search service`, error);
  }
}

startServer();

process.on("unhandledRejection", (reason, promise) => {
  logger.warn(`Unhandled rejection at ${promise} at ${reason}`);
});
