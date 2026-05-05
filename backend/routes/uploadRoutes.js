const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const {
  uploadAgentAvatar,
  uploadPropertyImages,
  uploadImage,
  deleteImage
} = require('../controllers/uploadController');

/**
 * @route   POST /api/upload/agent/:id/avatar
 * @desc    Upload agent profile picture
 * @access  Private (should add auth middleware)
 */
router.post('/agent/:id/avatar', uploadSingle('avatar'), uploadAgentAvatar);

/**
 * @route   POST /api/upload/property/:id/images
 * @desc    Upload property images
 * @access  Private (should add auth middleware)
 */
router.post('/property/:id/images', uploadMultiple('images', 10), uploadPropertyImages);

/**
 * @route   POST /api/upload/image
 * @desc    Generic image upload
 * @access  Private (should add auth middleware)
 */
router.post('/image', uploadSingle('image'), uploadImage);

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Delete uploaded image
 * @access  Private (should add auth middleware)
 */
router.delete('/:filename', deleteImage);

module.exports = router;
