require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Redis = require("ioredis");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const logger = require("./utils/logger");
const proxy = require("express-http-proxy");
const errorHandler = require("./middleware/errorHandler");
const { validateToken } = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

//rate-limiting
const limiter = rateLimit({
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

app.use(limiter);
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  if (Object.keys(req.body || {}).length > 0) {
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
  }
  next();
});

const proxyOption = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy Error: ${err.message}`);
    return res.status(500).json({
      message: `Internal server error`,
      error: err.message,
    });
  },
};

//setting up proxy for the identity service
app.use(
  `/v1/auth`,
  proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOption,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response receives from Identity services: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

// setting up proxy for posts service
app.use(
  "/v1/posts",
  validateToken,
  proxy(process.env.POST_SERVICE_URL, {
    ...proxyOption,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";

      // ✅ Forward the original Authorization token
      if (srcReq.headers["authorization"]) {
        proxyReqOpts.headers["authorization"] = srcReq.headers["authorization"];
      }

      // ✅ Optional: Send decoded user ID as a separate custom header
      if (srcReq.user?.userId) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      }

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response receives from Post service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

// setting up proxy for media service

app.use(
  "/v1/media",
  validateToken,
  proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOption,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // ✅ Forward the original Authorization token
      if (srcReq.headers["authorization"]) {
        proxyReqOpts.headers["authorization"] = srcReq.headers["authorization"];
      }

      // ✅ Optional: Send decoded user ID as a separate custom header
      if (srcReq.user?.userId) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      }
      const contentType = srcReq.headers["content-type"];
      if (!contentType?.startsWith("multipart/form-data")) {
        proxyReqOpts.headers["Content-Type"] = "application/json";
      }

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response receives from Media service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
    parseReqBody: false,
  })
);

// setting up proxy for search service
app.use(
  "/v1/search",
  validateToken,
  proxy(process.env.SEARCH_SERVICE_URL, {
    ...proxyOption,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // ✅ Forward the original Authorization token
      if (srcReq.headers["authorization"]) {
        proxyReqOpts.headers["authorization"] = srcReq.headers["authorization"];
      }

      // ✅ Optional: Send decoded user ID as a separate custom header
      if (srcReq.user?.userId) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      }
      const contentType = srcReq.headers["content-type"];
      if (!contentType?.startsWith("multipart/form-data")) {
        proxyReqOpts.headers["Content-Type"] = "application/json";
      }

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response receives from Search service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
    parseReqBody: false,
  })
);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
  logger.info(
    `Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`
  );
  logger.info(
    `Post service is running on port ${process.env.POST_SERVICE_URL}`
  );
  logger.info(
    `Search service is running on port ${process.env.SEARCH_SERVICE_URL}`
  );
  logger.info(
    `Media service is running on port ${process.env.MEDIA_SERVICE_URL}`
  );
  logger.info(`Redis connected: ${process.env.REDIS_URL}`);
});
