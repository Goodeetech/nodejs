const express = require("express");
const {
  addFeedback,
  getFeedbacks,
  getSingleFeedback,
} = require("../controllers/feedback-controller");

const router = express.Router();

router.get("/get-feedbacks", getFeedbacks);
router.get("/get-feedback/:id", getSingleFeedback);
router.post("/add-feedback", addFeedback);

module.exports = router;
