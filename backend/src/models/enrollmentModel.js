import mongoose from 'mongoose';

const enrollmentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Event',
    },
    ticketCode: {
      type: String,
      required: true,
      unique: true,
    },
    additionalResponses: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
    emailSent: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
