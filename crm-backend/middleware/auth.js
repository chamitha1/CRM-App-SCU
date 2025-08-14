const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid.'
    });
  }
};

// Middleware to check user role/permissions
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Middleware to check if user can access specific asset
const checkAssetAccess = async (req, res, next) => {
  try {
    // For now, allow all authenticated users to access assets
    // You can implement more specific access control here based on:
    // - User department
    // - Asset location
    // - Asset assignment
    // - User permissions
    
    next();
  } catch (error) {
    console.error('Asset access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking asset access permissions'
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  checkAssetAccess
};
