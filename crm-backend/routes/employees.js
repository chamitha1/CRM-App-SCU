const express = require('express');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all employees with optional date filtering
router.get('/', auth, async (req, res) => {
  try {
    const { from, to, allTime } = req.query;
    let query = {};
    
    // Apply date filtering if not allTime - filter by hire date if provided
    if (!allTime && from && to) {
      const startOfDay = new Date(from);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(to);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      // Filter by hireDate if it exists, otherwise no date filtering for employees
      query.$or = [
        { hireDate: { $gte: startOfDay, $lte: endOfDay } },
        { hireDate: { $exists: false } }
      ];
    }
    
    const employees = await Employee.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new employee
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating employee with data:', req.body);
    console.log('User ID:', req.user.id);
    
    const employee = new Employee({
      ...req.body,
      createdBy: req.user.id
    });
    
    console.log('Employee object before save:', employee);
    const savedEmployee = await employee.save();
    console.log('Saved employee:', savedEmployee);
    
    const populatedEmployee = await Employee.findById(savedEmployee._id)
      .populate('createdBy', 'name email');
    
    console.log('Populated employee:', populatedEmployee);
    res.status(201).json({
      message: 'Employee created',
      data: populatedEmployee
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update employee
router.put('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Delete employee
router.delete('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employees by department
router.get('/department/:department', auth, async (req, res) => {
  try {
    const employees = await Employee.find({ 
      department: new RegExp(req.params.department, 'i') 
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employees by role
router.get('/role/:role', auth, async (req, res) => {
  try {
    const employees = await Employee.find({ role: req.params.role })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
