import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  isPreview: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

export default mongoose.model('Video', videoSchema);