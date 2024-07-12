const express = require('express');
const router = express.Router();
const { Image, Project } = require('../models');
const cloudinary = require('../config/cloudinary');

// Helper function to upload to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({}, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    }).end(fileBuffer);
  });
};

// POST route to upload images
router.post('/', async (req, res) => {
  const { image, imagesArray, projectId } = req.body;

  if (!image && imagesArray.length === 0) {
    return res.status(400).json({ error: "No images provided" });
  }

  const cloudinaryObjectArray = [];
  try {
    if (image) {
      const imageBuffer = Buffer.from(image, 'base64');
      const imageUrl = await uploadToCloudinary(imageBuffer);
      cloudinaryObjectArray.push(imageUrl);
    }

    for (const file of imagesArray) {
      const fileBuffer = Buffer.from(file, 'base64');
      const fileUrl = await uploadToCloudinary(fileBuffer);
      cloudinaryObjectArray.push(fileUrl);
    }

    const imageRecords = await Image.bulkCreate(cloudinaryObjectArray.map(url => ({
      cloudinaryID: url.public_id,
      url: url.secure_url,
      projectId: projectId,
      main: false, // Update this as per your logic
    })));

    res.status(201).json(imageRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload images" });
  }
});

// DELETE route to delete images
router.delete('/', async (req, res) => {
  try {
    const { publicId, projectId } = req.body;

    if (!publicId && !projectId) {
      return res.status(400).json({ error: "Image ID and Project ID are required" });
    }

    if (Array.isArray(publicId) && projectId) {
      await Promise.all(publicId.map(async (id) => {
        const response = await cloudinary.uploader.destroy(id);
        if (response.result !== "ok") {
          throw new Error(`Failed to delete image with ID ${id}: ${response.result}`);
        }
        await Image.destroy({ where: { cloudinaryID: id } });
      }));
    } else if (publicId && !Array.isArray(publicId) && projectId) {
      const response = await cloudinary.uploader.destroy(publicId);
      if (response.result !== "ok") {
        throw new Error(`Failed to delete image with ID ${publicId}: ${response.result}`);
      }
      await Image.destroy({ where: { cloudinaryID: publicId } });
    } else if (publicId && !projectId) {
      const response = await cloudinary.uploader.destroy(publicId);
      if (response.result !== "ok") {
        throw new Error(`Failed to delete image with ID ${publicId}: ${response.result}`);
      }
    }

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: `Failed to delete image: ${error.message}` });
  }
});

module.exports = router;
