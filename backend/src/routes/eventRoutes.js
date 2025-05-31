import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  createEventReview,
  enrollToEvent,
  getMyEvents,
} from '../controllers/eventController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getEvents).post(protect, createEvent);
router.route('/myevents').get(protect, getMyEvents);
router.route('/:id/reviews').post(protect, createEventReview);
router.route('/:id/enroll').post(protect, enrollToEvent);
router.route('/:id').get(getEventById).put(protect, updateEvent).delete(protect, deleteEvent);

export default router;
