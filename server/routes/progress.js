import express from 'express';
import Progress from '../models/progess.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user's progress
router.get('/', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id });
    res.json({ progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update video progress
router.post('/', auth, async (req, res) => {
  try {
    const { courseId, videoId, completed } = req.body;
    
    let progress = await Progress.findOne({
      userId: req.user._id,
      courseId,
      videoId,
    });

    if (progress) {
      progress.completed = completed;
      await progress.save();
    } else {
      progress = new Progress({
        userId: req.user._id,
        courseId,
        videoId,
        completed,
      });
      await progress.save();
    }

    res.json({ progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;