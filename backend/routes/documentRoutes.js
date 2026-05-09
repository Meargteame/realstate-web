const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// Public/Protected routes
router.get('/', documentController.getDocuments);
router.get('/categories', documentController.getCategories);
router.get('/:id', documentController.getDocumentById);
router.get('/:id/download', documentController.downloadDocument);

// Protected routes (would need auth middleware in production)
router.post('/', documentController.createDocument);
router.patch('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);
router.post('/:id/share', documentController.shareDocument);

module.exports = router;
