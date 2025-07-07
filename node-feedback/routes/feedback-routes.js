const express = require("express");
const {
  addFeedback,
  getFeedbacks,
} = require("../controllers/feedback-controller");

const router = express.Router();

router.get("/get-feedbacks", getFeedbacks);
router.post("/add-feedback", addFeedback);

module.exports = router;
