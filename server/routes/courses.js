import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isApproved: true })
      .populate('teacherId', 'name')
      .populate('videos');
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get enrolled courses for student
router.get('/enrolled', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'enrolledCourses',
      populate: [
        {
          path: 'teacherId',
          select: 'name'
        },
        {
          path: 'videos'
        }
      ]
    });
    res.json({ courses: user.enrolledCourses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course enrollments (for teachers)
router.get('/:id/enrollments', auth, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const enrolledUsers = await User.find({
      enrolledCourses: req.params.id
    }).select('name email createdAt');

    const enrollments = enrolledUsers.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      enrolledAt: user.createdAt
    }));

    res.json({ enrollments });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ 
      _id: req.params.id,
      isApproved: true 
    })
    .populate('teacherId', 'name')
    .populate('videos');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({ course });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Enroll in a free course
router.post('/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.price > 0) {
      return res.status(400).json({ message: 'This is not a free course' });
    }

    const user = await User.findById(req.user._id);
    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    user.enrolledCourses.push(course._id);
    await user.save();
    
    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher's courses
router.get('/teacher/courses', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const courses = await Course.find({ teacherId: req.user._id })
      .populate('videos');
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const course = new Course({
      ...req.body,
      teacherId: req.user._id,
      isApproved: req.user.role === 'admin' // Auto-approve if admin creates course
    });
    await course.save();
    res.status(201).json({ course });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user._id },
      req.body,
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ course });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      teacherId: req.user._id,
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;