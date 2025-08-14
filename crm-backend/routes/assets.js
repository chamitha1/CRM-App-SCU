const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const { authenticate, authorize, checkAssetAccess } = require('../middleware/auth');

// Middleware for validation
const validateAsset = (req, res, next) => {
  const { name, type, serialNumber, purchaseDate, purchasePrice, location } = req.body;
  
  if (!name || !type || !serialNumber || !purchaseDate || !purchasePrice || !location) {
    return res.status(400).json({
      success: false,
      message: 'Name, type, serial number, purchase date, purchase price, and location are required'
    });
  }
  
  if (purchasePrice < 0) {
    return res.status(400).json({
      success: false,
      message: 'Purchase price cannot be negative'
    });
  }
  
  next();
};

// @route   GET /api/assets
// @desc    Get all assets with optional filtering and pagination
// @access  Private
router.get('/', authenticate, checkAssetAccess, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      location,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (location) query.location = new RegExp(location, 'i');
    if (assignedTo) query.assignedTo = new RegExp(assignedTo, 'i');
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { assignedTo: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const totalAssets = await Asset.countDocuments(query);

    // Fetch assets with pagination and sorting
    const assets = await Asset.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate pagination info
    const totalPages = Math.ceil(totalAssets / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: assets,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalAssets,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assets',
      error: error.message
    });
  }
});

// @route   GET /api/assets/stats
// @desc    Get asset statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const stats = await Asset.aggregate([
      {
        $group: {
          _id: null,
          totalAssets: { $sum: 1 },
          totalValue: { $sum: '$purchasePrice' },
          averageValue: { $avg: '$purchasePrice' }
        }
      }
    ]);

    const statusStats = await Asset.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Asset.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalValue: { $sum: '$purchasePrice' }
        }
      }
    ]);

    const locationStats = await Asset.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get assets due for maintenance
    const assetsDueForMaintenance = await Asset.findDueForMaintenance();

    res.json({
      success: true,
      data: {
        overview: stats[0] || { totalAssets: 0, totalValue: 0, averageValue: 0 },
        statusBreakdown: statusStats,
        typeBreakdown: typeStats,
        locationBreakdown: locationStats,
        maintenanceAlerts: {
          assetsDueForMaintenance: assetsDueForMaintenance.length,
          assets: assetsDueForMaintenance.map(asset => ({
            id: asset._id,
            name: asset.name,
            serialNumber: asset.serialNumber,
            lastMaintenance: asset.lastMaintenance,
            maintenanceStatus: asset.maintenanceStatus
          }))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching asset stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching asset statistics',
      error: error.message
    });
  }
});

// @route   GET /api/assets/:id
// @desc    Get single asset by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching asset',
      error: error.message
    });
  }
});

// @route   POST /api/assets
// @desc    Create new asset
// @access  Private
router.post('/', validateAsset, async (req, res) => {
  try {
    // Check if serial number already exists
    const existingAsset = await Asset.findOne({ serialNumber: req.body.serialNumber });
    if (existingAsset) {
      return res.status(400).json({
        success: false,
        message: 'An asset with this serial number already exists'
      });
    }

    const asset = new Asset(req.body);
    const savedAsset = await asset.save();

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: savedAsset
    });
  } catch (error) {
    console.error('Error creating asset:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An asset with this serial number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating asset',
      error: error.message
    });
  }
});

// @route   PUT /api/assets/:id
// @desc    Update asset
// @access  Private
router.put('/:id', validateAsset, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if serial number is being changed and if it conflicts with existing asset
    if (req.body.serialNumber !== asset.serialNumber) {
      const existingAsset = await Asset.findOne({ 
        serialNumber: req.body.serialNumber,
        _id: { $ne: req.params.id }
      });
      
      if (existingAsset) {
        return res.status(400).json({
          success: false,
          message: 'An asset with this serial number already exists'
        });
      }
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: updatedAsset
    });
  } catch (error) {
    console.error('Error updating asset:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An asset with this serial number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating asset',
      error: error.message
    });
  }
});

// @route   DELETE /api/assets/:id
// @desc    Delete asset
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    await Asset.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting asset:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting asset',
      error: error.message
    });
  }
});

// @route   POST /api/assets/:id/maintenance
// @desc    Add maintenance record to asset
// @access  Private
router.post('/:id/maintenance', async (req, res) => {
  try {
    const { date, description, cost, performedBy } = req.body;

    if (!date || !description || !performedBy) {
      return res.status(400).json({
        success: false,
        message: 'Date, description, and performed by are required for maintenance records'
      });
    }

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const maintenanceRecord = {
      date: new Date(date),
      description,
      cost: cost || 0,
      performedBy
    };

    await asset.addMaintenanceRecord(maintenanceRecord);

    res.json({
      success: true,
      message: 'Maintenance record added successfully',
      data: asset
    });
  } catch (error) {
    console.error('Error adding maintenance record:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding maintenance record',
      error: error.message
    });
  }
});

// @route   GET /api/assets/:id/maintenance
// @desc    Get maintenance history for asset
// @access  Private
router.get('/:id/maintenance', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).select('maintenanceHistory name serialNumber');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Sort maintenance history by date (most recent first)
    const sortedHistory = asset.maintenanceHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        assetInfo: {
          id: asset._id,
          name: asset.name,
          serialNumber: asset.serialNumber
        },
        maintenanceHistory: sortedHistory
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance history:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance history',
      error: error.message
    });
  }
});

// @route   GET /api/assets/maintenance/due
// @desc    Get all assets due for maintenance
// @access  Private
router.get('/maintenance/due', async (req, res) => {
  try {
    const assetsDue = await Asset.findDueForMaintenance();

    const assetsWithStatus = assetsDue.map(asset => ({
      ...asset.toObject(),
      maintenanceStatus: asset.maintenanceStatus,
      currentValue: asset.currentValue
    }));

    res.json({
      success: true,
      data: assetsWithStatus,
      count: assetsWithStatus.length
    });
  } catch (error) {
    console.error('Error fetching assets due for maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assets due for maintenance',
      error: error.message
    });
  }
});

module.exports = router;
