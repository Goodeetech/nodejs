const express = require("express");
const homeMiddleware = require("../middleware/home-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const uploadMiddleware = require("../middleware/upload-middleware");
const {
  uploadImage,
  getAllImages,
} = require("../controllers/image-controller");

const router = express.Router();
// upload image
router.post(
  "/upload",
  homeMiddleware,
  adminMiddleware,
  uploadMiddleware.single("image"),
  uploadImage
);

router.get("/get", homeMiddleware, getAllImages);

module.exports = router;
