const prisma = require('../config/prisma');
const path = require('path');
const fs = require('fs');

/**
 * Upload agent profile picture
 */
const uploadAgentAvatar = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📸 Uploading avatar for agent:', id);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('✅ File received:', req.file.filename);

    // Generate URL for the uploaded file
    const imageUrl = `/uploads/${req.file.filename}`;

    // Update agent record with new image URL
    const agent = await prisma.agent.update({
      where: { id: id }, // UUID string, not integer
      data: { imageUrl }
    });

    console.log('✅ Agent avatar updated');

    // Convert BigInt to Number for JSON serialization
    const agentData = JSON.parse(JSON.stringify(agent, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));

    res.json({
      success: true,
      imageUrl,
      agent: agentData
    });

  } catch (error) {
    console.error('Upload agent avatar error:', error);
    
    // Clean up uploaded file if database update fails
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

/**
 * Upload property images
 */
const uploadPropertyImages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Generate URLs for uploaded files
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    // Get existing property to preserve current images
    const property = await prisma.property.findUnique({
      where: { id: id } // Property IDs are UUIDs (strings)
    });

    if (!property) {
      // Clean up uploaded files if property doesn't exist
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      return res.status(404).json({ error: 'Property not found' });
    }

    // Update property with new images (replace imageUrl with first image)
    const updatedProperty = await prisma.property.update({
      where: { id: id }, // Property IDs are UUIDs (strings)
      data: {
        imageUrl: imageUrls[0] // Set first image as primary
        // Note: If you have an images array field, add it here
        // images: imageUrls
      }
    });

    // Convert BigInt to Number for JSON serialization
    const propertyData = JSON.parse(JSON.stringify(updatedProperty, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));

    res.json({
      success: true,
      imageUrls,
      property: propertyData
    });

  } catch (error) {
    console.error('Upload property images error:', error);
    
    // Clean up uploaded files if database update fails
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    res.status(500).json({ error: 'Failed to upload images' });
  }
};

/**
 * Generic image upload (returns URL without updating database)
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

/**
 * Delete uploaded file
 */
const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;

    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};

module.exports = {
  uploadAgentAvatar,
  uploadPropertyImages,
  uploadImage,
  deleteImage
};
