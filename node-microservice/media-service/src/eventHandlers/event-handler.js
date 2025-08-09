const Media = require("../models/Media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const handlePostDeleted = async (event) => {
  console.log({ event }, "handlePostDeleted event received");
  const { postId, mediaIds } = event;

  try {
    const mediaTodelete = await Media.find({ _id: { $in: mediaIds } });
    if (!mediaTodelete || mediaTodelete.length === 0) {
      logger.warn(`No media files found for postId: ${postId}`);
      return;
    }

    for (const media of mediaTodelete) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);
      logger.info(`Media file deleted: ${media.publicId}`);
    }

    logger.info(`Processed media files for postId: ${postId}`);
  } catch (error) {
    logger.error(`Error handling post deleted event: ${error.message}`);
    throw error(`Error handling post deleted event: ${error.message}`);
  }
};

// const handlePostDeletedHybridEvent = async (event) => {
//   // 1️⃣ Try deleting all files from Cloudinary in parallel
//   const deletionResults = await Promise.all(
//     mediaTodelete.map(async (media) => {
//       try {
//         await deleteMediaFromCloudinary(media.publicId);
//         logger.info(`Cloudinary deleted: ${media.publicId}`);
//         return media._id; // ✅ Return DB ID for successful deletion
//       } catch (err) {
//         logger.error(
//           `Failed to delete from Cloudinary: ${media.publicId} - ${err.message}`
//         );
//         return null; // ❌ Mark failed deletion
//       }
//     })
//   );

//   // 2️⃣ Filter only successfully deleted media IDs
//   const successfulIds = deletionResults.filter((id) => id !== null);

//   // 3️⃣ Delete those from MongoDB in one query
//   if (successfulIds.length > 0) {
//     await Media.deleteMany({ _id: { $in: successfulIds } });
//     logger.info(`Deleted ${successfulIds.length} media files from DB`);
//   } else {
//     logger.warn("No media deleted from DB because Cloudinary deletions failed");
//   }
// };

module.exports = { handlePostDeleted };
