const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const multer = require('multer');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log('Registration attempt:', { name, email, role });
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    
    console.log('User registered successfully:', email);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Development mode: Create default user if no users exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found. Creating default user for development...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const defaultUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      await defaultUser.save();
      console.log('Default user created: admin@example.com / admin123');
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 

// =============================
// Profile routes
// =============================

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = req.user; // from auth middleware, password excluded

    // Try to enrich with employee details
    let employee = await Employee.findOne({ createdBy: user._id });
    if (!employee) {
      // fallback by email if createdBy not set
      employee = await Employee.findOne({ email: user.email });
    }

    const profile = {
      name: user.name,
      email: user.email,
      phone: employee?.phone || '',
      department: employee?.department || '',
      hireDate: employee?.hireDate || null,
      salary: employee?.salary || null,
      status: employee?.status || 'active',
      avatarUrl: employee?.avatarUrl || ''
    };

    res.json(profile);
  } catch (err) {
    console.error('GET /auth/me error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update current user's basic profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Update user info
    if (name || email) {
      const updates = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    }

    // Update related employee record
    const employee = await Employee.findOne({ createdBy: req.user._id }) || await Employee.findOne({ email: req.user.email });
    if (employee) {
      if (name) employee.name = name;
      if (email) employee.email = email;
      if (typeof phone !== 'undefined') employee.phone = String(phone);
      await employee.save();
    }

    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('PUT /auth/me error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Avatar upload (placeholder implementation)
const upload = multer({ storage: multer.memoryStorage() });
router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    // In a real app, store to S3 or disk and save URL on employee
    const fakeUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.user.name || 'U')}`;
    const employee = await Employee.findOne({ createdBy: req.user._id }) || await Employee.findOne({ email: req.user.email });
    if (employee) {
      employee.avatarUrl = fakeUrl;
      await employee.save();
    }
    res.json({ avatarUrl: fakeUrl });
  } catch (err) {
    console.error('POST /auth/me/avatar error', err);
    res.status(500).json({ message: 'Server error' });
  }
});