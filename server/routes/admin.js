import express from 'express';
import auth from '../middleware/auth.js';
import TeacherApplication from '../models/TeacherApplication.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

const router = express.Router();

// Get all teacher applications (admin only)
router.get('/teacher-applications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await TeacherApplication.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (admin only)
router.put('/teacher-applications/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    const application = await TeacherApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    if (status === 'approved') {
      await User.findByIdAndUpdate(application.userId, { role: 'teacher' });
    }

    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all courses with approval status (admin only)
router.get('/courses', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const courses = await Course.find()
      .populate('teacherId', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve course (admin only)
router.put('/courses/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved: true,
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('teacherId', 'name email')
     .populate('approvedBy', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;