require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Use the same MongoDB URI as the server
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crm-app';

async function checkAndCreateUsers() {
  try {
    console.log('Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Check existing users
    const users = await User.find({});
    console.log('Existing users:', users.length);
    
    if (users.length > 0) {
      console.log('Users found:');
      users.forEach(user => {
        console.log(`- ${user.email} (${user.role})`);
      });
    } else {
      console.log('No users found. Creating default admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const defaultUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await defaultUser.save();
      console.log('Default user created successfully!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    }
    
    // Test login credentials
    console.log('\nTesting login credentials...');
    const user = await User.findOne({ email: 'admin@example.com' });
    if (user) {
      const isMatch = await bcrypt.compare('admin123', user.password);
      console.log('Password verification:', isMatch ? 'PASS' : 'FAIL');
    } else {
      console.log('User not found!');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndCreateUsers();
