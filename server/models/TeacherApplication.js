import mongoose from 'mongoose';

const teacherApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  documents: [{
    title: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  notes: String,
}, {
  timestamps: true,
});

export default mongoose.model('TeacherApplication', teacherApplicationSchema);