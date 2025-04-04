import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  previewUrl: {
    type: String,
    default: '',
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
  }],
}, {
  timestamps: true,
});

export default mongoose.model('Course', courseSchema);