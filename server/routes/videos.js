import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Video from '../models/Video.js';
import Course from '../models/Course.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const videosDir = path.join(uploadsDir, 'videos');
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(videosDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.mp4' && ext !== '.webm') {
      return cb(new Error('Only video files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// Get course videos
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const videos = await Video.find({ courseId: req.params.courseId }).sort('order');
    res.json({ videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload video
router.post('/', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const { title, courseId, order, isPreview } = req.body;
    const course = await Course.findOne({ _id: courseId, teacherId: req.user._id });
    
    if (!course) {
      // Clean up uploaded file if course validation fails
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Course not found' });
    }

    const video = new Video({
      title,
      url: `/uploads/videos/${req.file.filename}`,
      courseId,
      order: parseInt(order),
      isPreview: isPreview === 'true',
    });

    await video.save();
    course.videos.push(video._id);
    await course.save();

    res.status(201).json({ video });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update video
router.put('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const course = await Course.findOne({ _id: video.courseId, teacherId: req.user._id });
    if (!course) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(video, req.body);
    await video.save();
    res.json({ video });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const course = await Course.findOne({ _id: video.courseId, teacherId: req.user._id });
    if (!course) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete the video file
    const videoPath = path.join(__dirname, '..', video.url);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    await video.deleteOne();
    course.videos = course.videos.filter(v => v.toString() !== video._id.toString());
    await course.save();
    res.json({ message: 'Video deleted' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;