import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { auth } from '../utils/logger.js';

// Middleware to protect routes - verifies JWT token
const protect = async (req, res, next) => {
  let token;

  auth.debug('Checking for token');
  auth.debug('Headers:', req.headers.authorization);

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (remove 'Bearer' prefix)
      token = req.headers.authorization.split(' ')[1];
      auth.debug('Token found');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      auth.debug('Token verified');

      // Set req.user to authenticated user (without password)
      req.user = await User.findById(decoded.id).select('-password');
      auth.debug('User found:', req.user?._id);

      next();
    } catch (error) {
      auth.error('Token verification error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    auth.debug('No token found in authorization header');
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as admin');
  }
};

// Middleware to check if user is staff (admin or support)
const staff = (req, res, next) => {
  if (req.user && ['admin', 'support'].includes(req.user.role)) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as staff member');
  }
};

export { protect, admin, staff };
