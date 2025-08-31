const express = require('express');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all customers with optional date filtering
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
    
    const customers = await Customer.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get customer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('createdBy', 'name email');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new customer
router.post('/', auth, async (req, res) => {
  try {
    const customer = new Customer({
      ...req.body,
      createdBy: req.user.id
    });
    const savedCustomer = await customer.save();
    const populatedCustomer = await Customer.findById(savedCustomer._id).populate('createdBy', 'name email');
    res.status(201).json(populatedCustomer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update customer
router.put('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Delete customer
router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
