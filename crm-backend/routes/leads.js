const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
  getLeadsStats
} = require('../controllers/leadController');

// Import auth middleware
// const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes (temporarily disabled for testing)
// router.use(protect);

// @route   GET /api/leads/stats
// @desc    Get leads statistics
// @access  Private
router.get('/stats', getLeadsStats);

// @route   GET /api/leads
// @desc    Get all leads with pagination, filtering, and search
// @access  Private
router.get('/', getLeads);

// @route   GET /api/leads/:id
// @desc    Get single lead by ID
// @access  Private
router.get('/:id', getLeadById);

// @route   POST /api/leads
// @desc    Create new lead
// @access  Private
router.post('/', createLead);

// @route   PUT /api/leads/:id
// @desc    Update lead
// @access  Private
router.put('/:id', updateLead);

// @route   DELETE /api/leads/:id
// @desc    Delete lead
// @access  Private
router.delete('/:id', deleteLead);

// @route   POST /api/leads/:id/convert
// @desc    Convert lead to customer
// @access  Private
router.post('/:id/convert', convertLead);

module.exports = router;
