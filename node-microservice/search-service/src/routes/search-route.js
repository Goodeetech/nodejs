const express = require("express");
const searchPostController = require("../controllers/search-controller");
const { authenticationRequest } = require("../middleware/post-middleware");

const router = express.Router();

router.use(authenticationRequest);
router.get("/posts", searchPostController);

module.exports = router;
