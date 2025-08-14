const express = require('express');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all leads
router.get('/', auth, async (req, res) => {
  try {
    const leads = await Lead.find({})
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get lead by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new lead
router.post('/', auth, async (req, res) => {
  try {
    const lead = new Lead({
      ...req.body,
      createdBy: req.user.id
    });
    const savedLead = await lead.save();
    const populatedLead = await Lead.findById(savedLead._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    res.status(201).json(populatedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update lead
router.put('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Convert lead to customer
router.post('/:id/convert', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Create customer from lead data
    const customer = new Customer({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      notes: lead.notes,
      tags: lead.tags,
      createdBy: req.user.id,
      ...req.body // Allow additional customer data
    });

    const savedCustomer = await customer.save();
    
    // Update lead status to converted
    lead.status = 'closed_won';
    await lead.save();

    const populatedCustomer = await Customer.findById(savedCustomer._id).populate('createdBy', 'name email');
    res.status(201).json({
      customer: populatedCustomer,
      message: 'Lead converted to customer successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Customer with this email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
