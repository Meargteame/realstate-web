const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
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
 * @access  Private
 */
router.post('/agent/:id/avatar', authenticateToken, uploadSingle('avatar'), uploadAgentAvatar);

/**
 * @route   POST /api/upload/property/:id/images
 * @desc    Upload property images
 * @access  Private
 */
router.post('/property/:id/images', authenticateToken, uploadMultiple('images', 10), uploadPropertyImages);

/**
 * @route   POST /api/upload/image
 * @desc    Generic image upload
 * @access  Private
 */
router.post('/image', authenticateToken, uploadSingle('image'), uploadImage);

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Delete uploaded image
 * @access  Private
 */
router.delete('/:filename', authenticateToken, deleteImage);

module.exports = router;
