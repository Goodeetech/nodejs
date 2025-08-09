const { authenticationRequest } = require("../middleware/authMiddleware");
const multer = require("multer");
const logger = require("../utils/logger");
const express = require("express");
const { uploadMedia, getAllMedia } = require("../controllers/media-controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("file");

router.post(
  "/upload",
  authenticationRequest,
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        logger.error(`Multer error while uploading`, err);
        return res.status(400).json({
          message: "Multer error while uploading file",
          error: err,
          stack: err.stack,
        });
      } else if (err) {
        logger.error(`Unknown error occurred while uploading`, err);
        return res.status(500).json({
          message: "Unknown error occurred while uploading file",
          error: err,
          stack: err.stack,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file found",
        });
      }
      next();
    });
  },
  uploadMedia
);

router.get("/get-media", authenticationRequest, getAllMedia);

module.exports = router;
