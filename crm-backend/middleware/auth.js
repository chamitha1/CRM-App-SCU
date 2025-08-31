const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Development mode - skip auth if JWT_SECRET is not set
    if (!process.env.JWT_SECRET) {
      console.log('Development mode: Skipping authentication');
      // Create a mock user for development
      req.user = {
        id: '507f1f77bcf86cd799439011', // Mock ObjectId
        name: 'Dev User',
        email: 'dev@example.com'
      };
      return next();
    }
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
