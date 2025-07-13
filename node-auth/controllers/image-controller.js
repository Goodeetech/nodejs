const Image = require("../model/image");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");
const cloudinary = require("../config/cloudinary");

const fs = require("fs");

const uploadImage = async (req, res) => {
  try {
    // check if the file is present
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "File is required, please upload an image",
      });
    }

    //upload the file to cloudinary if present
    const { url, publicId } = await uploadToCloudinary(req.file.path);

    //store in the mongodb database

    const newImage = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.userId,
    });

    await newImage.save();

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: newImage,
    });
  } catch (error) {
    console.log("Error uploading file", error);
    res.status(500).json({
      success: false,
      error: error,
      message: "Something went wrong",
    });
  }
};

const getAllImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";

    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const totalImages = await Image.countDocuments();
    const totalPages = Math.ceil(totalImages / limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const allImages = await Image.find().sort(sortObj).skip(skip).limit(limit);

    if (!allImages) {
      res.status(404).json({
        success: false,
        message: "No images found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Images gotten successfully",

      currentPage: page,
      totalPages,
      totalImages,
      images: allImages,
    });
  } catch (error) {
    console.log("Error getting all images", error);
    res.status(500).json({
      success: false,
      error: error,
      message: "Something went wrong",
    });
  }
};

const deleteSingleImage = async (req, res) => {
  try {
    const imageId = req.params.id;

    const userId = req.userInfo.userId;

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({
        message: "Image not found",
        success: false,
      });
    }

    if (image.uploadedBy.toString() !== userId) {
      return res.status(500).json({
        success: false,
        message: "You are not authorized to delete this image",
      });
    }

    await cloudinary.uploader.destroy(image.publicId);
    await Image.findByIdAndDelete(imageId);

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting image", error);
    res.status(500).json({
      success: false,
      error: error,
      message: "Something went wrong",
    });
  }
};
module.exports = { uploadImage, getAllImages, deleteSingleImage };
