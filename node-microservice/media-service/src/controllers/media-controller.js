const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");
const Media = require("../models/Media");

const uploadMedia = async (req, res) => {
  logger.warn(`starting upload of file`);
  try {
    if (!req.file) {
      logger.error(`Upload file is missing, please upload a file `);
      return res.status(400).json({
        success: false,
        message: `Upload file is missing, please upload a file `,
      });
    }
    console.log(`details ${req.file}`);

    const { mimetype, originalname, buffer } = req.file;
    logger.info(`file name: ${originalname} ${mimetype}`);
    logger.info(`Uploading to cloudinary`);

    const cloudinaryUploadedFile = await uploadMediaToCloudinary(req.file);
    const userId = req.user.userId;

    logger.info(
      `File uploaded successfully with publicId: ${cloudinaryUploadedFile.public_id}`
    );

    const newlyUploadedFile = new Media({
      url: cloudinaryUploadedFile.secure_url,
      publicId: cloudinaryUploadedFile.public_id,
      originalName: originalname,
      mimeType: mimetype,
      userId,
    });

    await newlyUploadedFile.save();

    res.status(201).json({
      message: "File uploaded successfully",
      success: true,
      mediaId: newlyUploadedFile._id,
      url: newlyUploadedFile.url,
    });
  } catch (error) {
    logger.error(`Error occurred while uploading the file `);
    return res.status(500).json({
      success: false,
      message: "Error occurred while uploading the file",
    });
  }
};

const getAllMedia = async (req, res) => {
  try {
    const result = await Media.find({});
    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No media files found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Media files retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error occurred while getting all the files `);
    return res.status(500).json({
      success: false,
      message: "Error occurred while getting all the files",
    });
  }
};
module.exports = { uploadMedia, getAllMedia };
