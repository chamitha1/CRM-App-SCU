require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crm-app';

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }

    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    // Verify the user was created
    const user = await User.findOne({ email: 'admin@example.com' });
    if (user) {
      const isMatch = await bcrypt.compare('admin123', user.password);
      console.log('Password verification:', isMatch ? 'PASS' : 'FAIL');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
