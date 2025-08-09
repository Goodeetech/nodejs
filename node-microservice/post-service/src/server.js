require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const connectDB = require("./database/db");

const postRoute = require("./routes/post-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { connectToRabbitMQ } = require("./utils/rabbitmq");
// Connect DB
connectDB();

// Redis Client
const redisClient = new Redis(process.env.REDIS_URL);

// Express App
const app = express();

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
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoute
);

app.use(errorHandler);

const PORT2 = process.env.PORT2 || 3002;

async function startServer() {
  try {
    await connectToRabbitMQ();
    app.listen(PORT2, () => {
      console.log(`🚀 Post-sevice Server running on port ${PORT2}`);
      logger.info(`🚀 Post-sevice Server running on port ${PORT2}`);
    });
  } catch (error) {
    logger.error(`Failed to connect to the server ${error}`);
    process.exit(1);
  }
}

startServer();

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`unhandledRejection at ${(promise, "reason", reason)}`);
});
