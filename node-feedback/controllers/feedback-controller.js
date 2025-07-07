const mongoose = require("mongoose");
const Feedback = require("../models/feedback-model");

const addFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;

    const newFeedback = new Feedback({
      feedback,
    });
    await newFeedback.save();
    if (!newFeedback) {
      res.status(500).json({
        success: false,
        message: "Feedback cannot be empty",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "New Feedback sent successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while creating a new feedback",
      error: error.message,
      success: false,
    });
  }
};

const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({});
    if (!feedbacks) {
      res.status(404).json({
        success: false,
        message: "Couldn't find the feedbacks, try again later",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Feedbacks successfully gotten",
        data: feedbacks,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const getSingleFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const singleFeedback = await Feedback.findById(id);

    if (!singleFeedback) {
      res.status(404).json({
        status: false,
        message: "Feedback can not be found, check again",
      });
    } else {
      res.status(200).json({
        status: true,
        message: "Feedback found successfully",
        data: singleFeedback,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

module.exports = { addFeedback, getFeedbacks, getSingleFeedback };
