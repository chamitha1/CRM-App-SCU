const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, Images, and Text files are allowed.'), false);
    }
  }
});

// Helper function to check user role
const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const employee = await Employee.findById(req.user.id);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      
      if (requiredRole === 'admin' && employee.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      if (requiredRole === 'manager' && !['admin', 'manager'].includes(employee.role)) {
        return res.status(403).json({ message: 'Manager access required' });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

// Upload a new document
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, category, tags } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }

    // Parse tags if they come as a string
    const parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags || [];

    const document = new Document({
      title,
      description,
      category,
      tags: parsedTags,
      uploadedBy: req.user.id,
      fileType: req.file.mimetype,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileUrl: `/uploads/${req.file.filename}`
    });

    await document.save();
    
    // Populate uploadedBy field
    await document.populate('uploadedBy', 'firstName lastName');
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all documents with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'uploadedAt',
      sortOrder = 'desc',
      from,
      to,
      allTime
    } = req.query;

    const query = { isActive: true };
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Date range filter
    if (!allTime && from && to) {
      const startOfDay = new Date(from);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(to);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      query.uploadedAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (page - 1) * limit;
    
    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('uploadedBy', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Document.countDocuments(query)
    ]);
    
    res.json({
      documents,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    });
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single document by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update document metadata
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user can edit (admin, manager, or document owner)
    const employee = await Employee.findById(req.user.id);
    if (employee.role !== 'admin' && 
        employee.role !== 'manager' && 
        document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Parse tags if they come as a string
    const parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        tags: parsedTags,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'firstName lastName');
    
    res.json({
      message: 'Document updated successfully',
      document: updatedDocument
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update document file (re-upload)
router.put('/:id/file', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user can edit
    const employee = await Employee.findById(req.user.id);
    if (employee.role !== 'admin' && 
        employee.role !== 'manager' && 
        document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Delete old file
    const oldFilePath = path.join(__dirname, '..', document.fileUrl);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
    
    // Update document with new file info
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      {
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileUrl: `/uploads/${req.file.filename}`,
        version: document.version + 1,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'firstName lastName');
    
    res.json({
      message: 'Document file updated successfully',
      document: updatedDocument
    });
  } catch (error) {
    console.error('File update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete document
router.delete('/:id', auth, checkRole('manager'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete physical file
    const filePath = path.join(__dirname, '..', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Soft delete from database
    await Document.findByIdAndUpdate(req.params.id, { isActive: false });
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Download document
router.get('/download/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const filePath = path.join(__dirname, '..', document.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    res.download(filePath, document.fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get document statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const [totalDocs, categoryStats, recentUploads] = await Promise.all([
      Document.countDocuments({ isActive: true }),
      Document.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Document.find({ isActive: true })
        .populate('uploadedBy', 'firstName lastName')
        .sort({ uploadedAt: -1 })
        .limit(5)
    ]);
    
    res.json({
      totalDocuments: totalDocs,
      categoryDistribution: categoryStats,
      recentUploads
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
