import express from 'express';
import {
  authUser,
  registerUser,
  createUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  updateUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', authUser);
router.post('/register', registerUser);

// Protected routes
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// Admin routes
router
  .route('/')
  .post(protect, admin, createUser) // Create user (admin only)
  .get(protect, admin, getUsers); // Get all users (admin only)

router
  .route('/:id')
  .delete(protect, admin, deleteUser) // Delete user (admin only)
  .put(protect, admin, updateUser); // Update user (admin only)

export default router;
