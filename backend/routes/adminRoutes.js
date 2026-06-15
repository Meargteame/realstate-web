const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(isAdmin);

// =====================================================
// PLATFORM STATISTICS
// =====================================================
router.get('/stats', adminController.getPlatformStats);
router.get('/trends', adminController.getPlatformTrends);
router.get('/top-agents', adminController.getTopAgents);

// =====================================================
// USER MANAGEMENT
// =====================================================
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// =====================================================
// AGENT MANAGEMENT
// =====================================================
router.get('/agents', adminController.getAllAgents);
router.put('/agents/:id/status', adminController.updateAgentStatus);
router.delete('/agents/:id', adminController.deleteAgent);

// =====================================================
// PROPERTY MANAGEMENT
// =====================================================
router.get('/properties', adminController.getAllProperties);
router.put('/properties/:id/status', adminController.updatePropertyStatus);
router.delete('/properties/:id', adminController.deleteProperty);

module.exports = router;
