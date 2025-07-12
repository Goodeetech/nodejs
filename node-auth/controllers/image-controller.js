const Image = require("../model/image");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");

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
  const allImages = await Image.find({});

  if (!allImages) {
    res.status(404).json({
      success: false,
      message: "No images found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Images gotten successfully",
    images: allImages,
  });
};

module.exports = { uploadImage, getAllImages };
