import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521',
    },
    stateRegion: {
      type: String,
      required: function () {
        return this.locationType === 'onsite';
      },
    },
    location: {
      type: String,
      required: function () {
        return this.locationType === 'onsite';
      },
    },
    locationType: {
      type: String,
      enum: ['onsite', 'remote'],
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
      set: function (date) {
        // If startTime is set, combine date with time
        if (this.startTime) {
          const [hours, minutes] = this.startTime.split(':');
          const newDate = new Date(date);
          newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
          return newDate;
        }
        return date;
      },
    },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: props => `${props.value} is not a valid time format! Use HH:mm`,
      },
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: props => `${props.value} is not a valid time format! Use HH:mm`,
      },
    },
    organizer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    maxAttendees: {
      type: Number,
      default: 0,
    },
    currentAttendees: {
      type: Number,
      default: 0,
    },
    meetingLink: {
      type: String,
      required: function () {
        return this.locationType === 'remote';
      },
    },
    address: {
      type: String,
      required: function () {
        return this.locationType === 'onsite';
      },
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save middleware to ensure eventDate includes the time
eventSchema.pre('save', function (next) {
  if (this.startTime && this.eventDate) {
    const [hours, minutes] = this.startTime.split(':');
    const date = new Date(this.eventDate);
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    this.eventDate = date;
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
