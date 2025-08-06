const express = require("express");
const {
  createPost,
  getAllPosts,
  getSinglePost,
  deletePost,
} = require("../controllers/post-controller");
const { authenticationRequest } = require("../middleware/post-middleware");

const router = express.Router();
// middleware
router.use(authenticationRequest);

router.post("/create-post", createPost);
router.get("/get-posts", getAllPosts);
router.get("/get-post/:id", getSinglePost);
router.delete("/delete-post/:id", deletePost);

module.exports = router;
