const express = require("express");
const { createPost, getAllPosts } = require("../controllers/post-controller");
const { authenticationRequest } = require("../middleware/post-middleware");

const router = express.Router();
// middleware
router.use(authenticationRequest);

router.post("/create-post", createPost);
router.get("/get-posts", getAllPosts);

module.exports = router;
