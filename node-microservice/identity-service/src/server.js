require("dotenv").config();
const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const sgMail = require("@sendgrid/mail");

const logger = require("./utils/logger");
const connectDB = require("./database/db");
const userAuthRoute = require("./routes/identity-service");
const errorHandler = require("./middleware/errorHandler");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");

// Load environment variables
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
app.use("/api/auth", sensitiveEndpointRateLimiter, userAuthRoute);

//email emitter

async function handleUserRegisterEmail(event) {
  if (typeof event === "string" || Buffer.isBuffer(event)) {
    event = JSON.parse(event.toString());
  }
  logger.info(`Recieved user.registered event ${event}`);

  const msg = {
    to: event.email,
    from: "ayomidegoodee@gmail.com", // Must be verified in SendGrid
    subject: "Welcome to My App 🎉",
    text: `Hi ${event.username}, thanks for joining us!`,
    html: `<strong>Hi ${event.username}</strong>, thanks for joining us! 🎉`,
  };

  try {
    await sgMail.send(msg);
    logger.info(`Email send successfully ${event}`);
  } catch (error) {
    logger.error(`Error sending the welcome email`);
  }
}

// Global Error Handler
app.use(errorHandler);

// Start Server

async function startServer() {
  try {
    await connectToRabbitMQ();
    await consumeEvent("register.email", handleUserRegisterEmail);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`🚀 Identity-sevice Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Error occurred while starting the identity server `);
  }
}

startServer();

//unhandles promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`unhandledRejection at ${(promise, "reason", reason)}`);
});
