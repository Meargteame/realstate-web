const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/auth');

// Public/Protected read routes (use authenticateToken to set req.user if available)
router.get('/categories', documentController.getCategories);
router.get('/', authenticateToken, documentController.getDocuments);
router.get('/:id', authenticateToken, documentController.getDocumentById);
router.get('/:id/download', authenticateToken, documentController.downloadDocument);

// Protected write routes — require authentication
router.post('/', authenticateToken, documentController.createDocument);
router.patch('/:id', authenticateToken, documentController.updateDocument);
router.delete('/:id', authenticateToken, documentController.deleteDocument);
router.post('/:id/share', authenticateToken, documentController.shareDocument);

module.exports = router;
