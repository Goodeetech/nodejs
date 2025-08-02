require("dotenv").config();
const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");

const logger = require("./utils/logger");
const connectDB = require("./database/db");
const userAuthRoute = require("./routes/identity-service");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

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

// DDOS Protection - General Rate Limiter
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10, // requests
  duration: 1, // per second
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    return res.status(429).json({
      success: false,
      message: "Too many requests",
    });
  }
});

// Sensitive Endpoint Rate Limiter
const sensitiveEndpointRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Max requests per IP per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    return res.status(429).json({
      success: false,
      message: "Too many requests",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// Routes
app.use("/api/auth/register", sensitiveEndpointRateLimiter);
app.use("/api/auth", userAuthRoute);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Identity-sevice Server running on port ${PORT}`);
});

//unhandles promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`unhandledRejection at ${(promise, "reason", reason)}`);
});
