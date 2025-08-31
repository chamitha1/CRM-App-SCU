const express = require('express');
const Asset = require('../models/Asset');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all assets with optional date filtering
router.get('/', auth, async (req, res) => {
  try {
    const { from, to, allTime } = req.query;
    let query = {};
    
    // Apply date filtering if not allTime
    if (!allTime && from && to) {
      const startOfDay = new Date(from);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(to);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    const assets = await Asset.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('customerId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get asset by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('customerId', 'firstName lastName email');
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new asset
router.post('/', auth, async (req, res) => {
  try {
    const asset = new Asset({
      ...req.body,
      createdBy: req.user.id
    });
    
    const savedAsset = await asset.save();
    const populatedAsset = await Asset.findById(savedAsset._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('customerId', 'firstName lastName email');
    
    res.status(201).json(populatedAsset);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.serialNumber) {
      return res.status(400).json({ message: 'Serial number already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update asset
router.put('/:id', auth, async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('customerId', 'firstName lastName email');
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.serialNumber) {
      return res.status(400).json({ message: 'Serial number already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Delete asset
router.delete('/:id', auth, async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assets by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const assets = await Asset.find({ category: req.params.category })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('customerId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assets by status
router.get('/status/:status', auth, async (req, res) => {
  try {
    const assets = await Asset.find({ status: req.params.status })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('customerId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assets needing maintenance
router.get('/maintenance/due', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    const assets = await Asset.find({
      'maintenanceSchedule.nextService': {
        $lte: currentDate
      },
      status: { $in: ['active', 'maintenance'] }
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('customerId', 'firstName lastName email')
      .sort({ 'maintenanceSchedule.nextService': 1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
