const prisma = require('../config/prisma');

// Helper to check if user has admin role
async function checkAdmin(userId) {
  if (!userId) return false;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    return user?.role === 'admin';
  } catch {
    return false;
  }
}

// GET /api/documents - Get all documents for current user
exports.getDocuments = async (req, res) => {
  try {
    const { category, propertyId, leadId, search, status } = req.query;
    const userId = req.user?.id || req.query.userId;
    
    // Build where clause
    const where = {};
    
    // Only filter by user if userId is provided
    if (userId) {
      const isAdmin = await checkAdmin(userId);
      if (!isAdmin) {
        where.OR = [
          { uploadedBy: userId },
          { sharedWith: { has: userId } }
        ];
      }
    }
    
    if (category) where.category = category;
    if (propertyId) where.propertyId = propertyId;
    if (leadId) where.leadId = leadId;
    if (status) where.status = status;
    
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { fileName: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }
    
    const documents = await prisma.document.findMany({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true
          }
        },
        lead: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        versions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// GET /api/documents/:id - Get single document
exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.query.userId;
    
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        property: true,
        lead: true,
        versions: {
          orderBy: { version: 'desc' }
        },
        accessLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check access permission
    const isAdmin = await checkAdmin(userId);
    if (!isAdmin && document.uploadedBy !== userId && !document.sharedWith.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Log access
    await prisma.documentAccess.create({
      data: {
        documentId: id,
        userId,
        action: 'view',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// POST /api/documents - Upload new document
exports.createDocument = async (req, res) => {
  try {
    const {
      name,
      fileName,
      fileUrl,
      fileSize,
      fileType,
      category,
      propertyId,
      leadId,
      description,
      tags,
      sharedWith
    } = req.body;
    
    const userId = req.user?.id || req.body.uploadedBy;
    
    if (!name || !fileName || !fileUrl || !fileSize || !fileType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const document = await prisma.document.create({
      data: {
        name,
        fileName,
        fileUrl,
        fileSize: parseInt(fileSize),
        fileType,
        category: category || 'general',
        propertyId: propertyId || null,
        leadId: leadId || null,
        uploadedBy: userId,
        description: description || null,
        tags: tags || [],
        sharedWith: sharedWith || [],
        version: 1
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Create initial version
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        fileUrl,
        fileSize: parseInt(fileSize),
        uploadedBy: userId,
        changeNote: 'Initial upload'
      }
    });
    
    // Log upload
    await prisma.documentAccess.create({
      data: {
        documentId: document.id,
        userId,
        action: 'upload',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });
    
    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// PATCH /api/documents/:id - Update document
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.body.userId;
    const {
      name,
      description,
      category,
      tags,
      sharedWith,
      status,
      fileUrl,
      fileSize,
      changeNote
    } = req.body;
    
    // Check ownership
    const existing = await prisma.document.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const isAdmin = await checkAdmin(userId);
    if (!isAdmin && existing.uploadedBy !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (tags !== undefined) data.tags = tags;
    if (sharedWith !== undefined) data.sharedWith = sharedWith;
    if (status !== undefined) data.status = status;
    
    // If new file version
    if (fileUrl && fileSize) {
      data.fileUrl = fileUrl;
      data.fileSize = parseInt(fileSize);
      data.version = { increment: 1 };
      
      // Create new version
      await prisma.documentVersion.create({
        data: {
          documentId: id,
          version: existing.version + 1,
          fileUrl,
          fileSize: parseInt(fileSize),
          uploadedBy: userId,
          changeNote: changeNote || 'Updated version'
        }
      });
    }
    
    const document = await prisma.document.update({
      where: { id },
      data,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Log update
    await prisma.documentAccess.create({
      data: {
        documentId: id,
        userId,
        action: 'update',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });
    
    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// DELETE /api/documents/:id - Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.query.userId;
    
    // Check ownership
    const existing = await prisma.document.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const isAdmin = await checkAdmin(userId);
    if (!isAdmin && existing.uploadedBy !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Soft delete by setting status to deleted
    await prisma.document.update({
      where: { id },
      data: { status: 'deleted' }
    });
    
    // Log deletion
    await prisma.documentAccess.create({
      data: {
        documentId: id,
        userId,
        action: 'delete',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// POST /api/documents/:id/share - Share document with users
exports.shareDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    const userId = req.user?.id || req.body.userId;
    
    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds must be an array' });
    }
    
    // Check ownership
    const document = await prisma.document.findUnique({
      where: { id }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const isAdmin = await checkAdmin(userId);
    if (!isAdmin && document.uploadedBy !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Add users to sharedWith
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        sharedWith: {
          set: [...new Set([...document.sharedWith, ...userIds])]
        }
      }
    });
    
    // Log share action
    await prisma.documentAccess.create({
      data: {
        documentId: id,
        userId,
        action: 'share',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });
    
    res.json(updatedDocument);
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// GET /api/documents/:id/download - Download document (logs access)
exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.query.userId;
    
    const document = await prisma.document.findUnique({
      where: { id }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check access permission
    const isAdmin = await checkAdmin(userId);
    if (!isAdmin && document.uploadedBy !== userId && !document.sharedWith.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Log download
    await prisma.documentAccess.create({
      data: {
        documentId: id,
        userId,
        action: 'download',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });
    
    // Return file URL for client to download
    res.json({ fileUrl: document.fileUrl, fileName: document.fileName });
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// GET /api/documents/categories - Get document categories
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'contract', label: 'Contracts', icon: 'FileTextOutlined' },
      { value: 'disclosure', label: 'Disclosures', icon: 'FileProtectOutlined' },
      { value: 'inspection', label: 'Inspections', icon: 'SearchOutlined' },
      { value: 'listing', label: 'Listings', icon: 'HomeOutlined' },
      { value: 'offer', label: 'Offers', icon: 'DollarOutlined' },
      { value: 'closing', label: 'Closing Documents', icon: 'CheckCircleOutlined' },
      { value: 'financial', label: 'Financial', icon: 'BankOutlined' },
      { value: 'legal', label: 'Legal', icon: 'SafetyOutlined' },
      { value: 'marketing', label: 'Marketing', icon: 'RocketOutlined' },
      { value: 'general', label: 'General', icon: 'FolderOutlined' }
    ];
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
};

module.exports = exports;
