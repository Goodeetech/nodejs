require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const connectDB = require("./database/db");

const mediaRoute = require("./routes/media-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./eventHandlers/event-handler");

const app = express();

const PORT = process.env.PORT;

connectDB();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`[MEDIA SERVICE] ${req.method} ${req.url}`);
  next();
});

// Request Logger
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  if (Object.keys(req.body || {}).length > 0) {
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
  }
  next();
});

app.use("/api/media", mediaRoute);

app.use(errorHandler);
async function startServer() {
  try {
    await connectToRabbitMQ();
    await consumeEvent("post.deleted", handlePostDeleted);
    app.listen(PORT, () => {
      console.log(`🚀 Media-sevice Server running on port ${PORT}`);
      logger.info(`🚀 Media-sevice Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to connect to the server ${error}`);
    process.exit(1);
  }
}

startServer();

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at Promise:", promise, "Reason:", reason);
});
