const Lead = require('../models/Lead');
const mongoose = require('mongoose');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    // Mock data for testing without MongoDB
    const mockLeads = [
      {
        _id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1-555-0123',
        company: 'Tech Solutions Inc',
        source: 'Website',
        status: 'new',
        estimatedValue: 50000,
        notes: 'Interested in our enterprise package',
        createdAt: new Date(),
        nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        _id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        phone: '+1-555-0124',
        company: 'Marketing Pro Ltd',
        source: 'Referral',
        status: 'contacted',
        estimatedValue: 75000,
        notes: 'Follow up next week',
        createdAt: new Date(),
        nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        _id: '3',
        name: 'Mike Wilson',
        email: 'mike@startup.io',
        phone: '+1-555-0125',
        company: 'Startup Innovations',
        source: 'LinkedIn',
        status: 'qualified',
        estimatedValue: 100000,
        notes: 'Ready to move forward with proposal',
        createdAt: new Date(),
        nextFollowUp: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
      }
    ];
    
    const { page = 1, limit = 10 } = req.query;
    const total = mockLeads.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedLeads = mockLeads.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedLeads,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
      error: error.message
    });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID'
      });
    }
    
    const lead = await Lead.findById(id).populate('assignedTo', 'name email');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead',
      error: error.message
    });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      source,
      status,
      estimatedValue,
      notes,
      assignedTo,
      nextFollowUp
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !company) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, company'
      });
    }
    
    // Mock response for testing without MongoDB
    const mockLead = {
      _id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      company: company.trim(),
      source: source || 'Website',
      status: status || 'new',
      estimatedValue: estimatedValue || 0,
      notes: notes ? notes.trim() : '',
      assignedTo: assignedTo || null,
      nextFollowUp: nextFollowUp || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: mockLead
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lead',
      error: error.message
    });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID'
      });
    }
    
    // Find the lead first
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    // Check if email is being updated and if it conflicts with existing lead
    if (updates.email && updates.email.toLowerCase() !== lead.email) {
      const existingLead = await Lead.findOne({ 
        email: updates.email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (existingLead) {
        return res.status(400).json({
          success: false,
          message: 'Another lead with this email already exists'
        });
      }
    }
    
    // Clean and validate updates
    const allowedUpdates = [
      'name', 'email', 'phone', 'company', 'source', 'status', 
      'estimatedValue', 'notes', 'assignedTo', 'nextFollowUp'
    ];
    
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (typeof updates[key] === 'string') {
          filteredUpdates[key] = updates[key].trim();
        } else {
          filteredUpdates[key] = updates[key];
        }
      }
    });
    
    // Update email to lowercase if provided
    if (filteredUpdates.email) {
      filteredUpdates.email = filteredUpdates.email.toLowerCase();
    }
    
    // Update last contact date if status is being changed to 'contacted'
    if (filteredUpdates.status === 'contacted' && lead.status !== 'contacted') {
      filteredUpdates.lastContactDate = new Date();
    }
    
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      filteredUpdates,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('assignedTo', 'name email');
    
    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Lead with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating lead',
      error: error.message
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID'
      });
    }
    
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    await Lead.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lead',
      error: error.message
    });
  }
};

// @desc    Convert lead to customer
// @route   POST /api/leads/:id/convert
// @access  Private
const convertLead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID'
      });
    }
    
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    // Update lead status to converted (you might want to add this status to enum)
    // or delete the lead after creating customer
    lead.status = 'qualified'; // Temporary status update
    await lead.save();
    
    // Here you would typically create a customer record
    // const Customer = require('../models/Customer');
    // const customer = new Customer({
    //   name: lead.name,
    //   email: lead.email,
    //   phone: lead.phone,
    //   company: lead.company,
    //   convertedFrom: lead._id
    // });
    // await customer.save();
    
    res.json({
      success: true,
      message: 'Lead converted successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error converting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error converting lead',
      error: error.message
    });
  }
};

// @desc    Get leads summary/statistics
// @route   GET /api/leads/stats
// @access  Private
const getLeadsStats = async (req, res) => {
  try {
    // Mock statistics for testing without MongoDB
    const mockStats = {
      totalLeads: 23,
      recentLeads: 8,
      statusBreakdown: [
        { _id: 'new', count: 8 },
        { _id: 'contacted', count: 7 },
        { _id: 'qualified', count: 5 },
        { _id: 'unqualified', count: 3 }
      ]
    };
    
    res.json({
      success: true,
      data: mockStats
    });
  } catch (error) {
    console.error('Error fetching leads stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads statistics',
      error: error.message
    });
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
  getLeadsStats
};
