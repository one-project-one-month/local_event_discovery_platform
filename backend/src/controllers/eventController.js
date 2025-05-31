import Event from '../models/eventModel.js';
import Enrollment from '../models/enrollmentModel.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Fetch all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};
  const location = req.query.location ? { location: req.query.location } : {};
  const stateRegion = req.query.stateRegion ? { stateRegion: req.query.stateRegion } : {};
  const type = req.query.type ? { locationType: req.query.type } : {};
  const status = req.query.status ? { status: req.query.status } : {};

  // Date filter
  const dateFilter = {};
  if (req.query.date) {
    const searchDate = new Date(req.query.date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    dateFilter.eventDate = {
      $gte: searchDate,
      $lt: nextDay,
    };
  }

  const count = await Event.countDocuments({
    ...keyword,
    ...category,
    ...location,
    ...stateRegion,
    ...type,
    ...status,
    ...dateFilter,
  });

  const events = await Event.find({
    ...keyword,
    ...category,
    ...location,
    ...stateRegion,
    ...type,
    ...status,
    ...dateFilter,
  })
    .populate('user', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ eventDate: 1 });

  res.json({
    events,
    page,
    pages: Math.ceil(count / pageSize),
    count,
  });
};

// @desc    Fetch single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id).populate('user', 'name');

  if (event) {
    res.json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
};

// @desc    Create a event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    console.log('Creating event, received data:', JSON.stringify(req.body, null, 2));

    const {
      name,
      coverImage,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      stateRegion,
      locationType,
      address,
      coordinates,
      meetingLink,
      category,
      isFree,
      price,
      organizer,
      maxAttendees,
      additionalQuestions,
    } = req.body;

    const event = new Event({
      user: req.user._id,
      name,
      coverImage,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      stateRegion,
      locationType,
      address,
      coordinates,
      meetingLink,
      category,
      isFree,
      price,
      organizer,
      maxAttendees,
      currentAttendees: 0,
      additionalQuestions: additionalQuestions || [],
      numReviews: 0,
      rating: 0,
    });

    const createdEvent = await event.save();
    console.log('Event created successfully:', createdEvent._id);
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  const {
    name,
    coverImage,
    description,
    eventDate,
    startTime,
    endTime,
    location,
    stateRegion,
    locationType,
    address,
    coordinates,
    meetingLink,
    category,
    isFree,
    price,
    organizer,
    maxAttendees,
    status,
    additionalQuestions,
  } = req.body;

  const event = await Event.findById(req.params.id);

  if (event) {
    // Check if user is the event creator or an admin
    if (event.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized to update this event');
    }

    // Update fields with new values, allowing empty strings
    event.name = name !== undefined ? name : event.name;
    event.coverImage = coverImage !== undefined ? coverImage : event.coverImage;
    event.description = description !== undefined ? description : event.description;
    event.eventDate = eventDate !== undefined ? eventDate : event.eventDate;
    event.startTime = startTime !== undefined ? startTime : event.startTime;
    event.endTime = endTime !== undefined ? endTime : event.endTime;
    event.location = location !== undefined ? location : event.location;
    event.stateRegion = stateRegion !== undefined ? stateRegion : event.stateRegion;
    event.locationType = locationType !== undefined ? locationType : event.locationType;
    event.address = address !== undefined ? address : event.address;
    event.coordinates = coordinates !== undefined ? coordinates : event.coordinates;
    event.meetingLink = meetingLink !== undefined ? meetingLink : event.meetingLink;
    event.category = category !== undefined ? category : event.category;
    event.isFree = isFree !== undefined ? isFree : event.isFree;
    event.price = price !== undefined ? price : event.price;
    event.organizer = organizer !== undefined ? organizer : event.organizer;
    event.maxAttendees = maxAttendees !== undefined ? maxAttendees : event.maxAttendees;
    event.status = status !== undefined ? status : event.status;
    event.additionalQuestions =
      additionalQuestions !== undefined ? additionalQuestions : event.additionalQuestions;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
};

// @desc    Delete a event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    // Check if user is the event creator or an admin
    if (event.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized to delete this event');
    }

    // Actually delete the event from the database
    await Event.deleteOne({ _id: req.params.id });

    res.json({ message: 'Event removed' });
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
};

// @desc    Create new review
// @route   POST /api/events/:id/reviews
// @access  Private
const createEventReview = async (req, res) => {
  const { rating, comment } = req.body;

  const event = await Event.findById(req.params.id);

  if (event) {
    // Check if user has already reviewed
    const alreadyReviewed = event.reviews.find(r => r.user.toString() === req.user._id.toString());

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Event already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    event.reviews.push(review);

    event.numReviews = event.reviews.length;

    event.rating = event.reviews.reduce((acc, item) => item.rating + acc, 0) / event.reviews.length;

    await event.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
};

// @desc    Enroll to an event
// @route   POST /api/events/:id/enroll
// @access  Private
const enrollToEvent = async (req, res) => {
  const { additionalResponses } = req.body;

  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Check if event is full
  if (event.maxAttendees > 0 && event.currentAttendees >= event.maxAttendees) {
    res.status(400);
    throw new Error('Event is already full');
  }

  // Check if user is already enrolled
  const existingEnrollment = await Enrollment.findOne({
    user: req.user._id,
    event: req.params.id,
    status: 'active',
  });

  if (existingEnrollment) {
    res.status(400);
    throw new Error('You are already enrolled to this event');
  }

  // Generate unique ticket code
  const ticketCode = uuidv4().substring(0, 8).toUpperCase();

  // Create new enrollment
  const enrollment = new Enrollment({
    user: req.user._id,
    event: req.params.id,
    ticketCode,
    additionalResponses: additionalResponses || [],
    status: 'active',
    emailSent: false,
  });

  // Increment currentAttendees
  event.currentAttendees += 1;
  await event.save();

  const newEnrollment = await enrollment.save();

  res.status(201).json(newEnrollment);
};

// @desc    Get user events
// @route   GET /api/events/myevents
// @access  Private
const getMyEvents = async (req, res) => {
  // Get events created by the user
  const createdEvents = await Event.find({ user: req.user._id });

  // Get events enrolled by the user
  const enrollments = await Enrollment.find({
    user: req.user._id,
    status: 'active',
  }).populate('event');

  const enrolledEvents = enrollments.map(enrollment => enrollment.event);

  res.json({
    createdEvents,
    enrolledEvents,
  });
};

export {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  createEventReview,
  enrollToEvent,
  getMyEvents,
};
