import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js';
import TeacherApplication from '../models/TeacherApplication.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/documents'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Submit teacher application
router.post('/apply', auth, upload.array('documents', 5), async (req, res) => {
  try {
    const existingApplication = await TeacherApplication.findOne({ userId: req.user._id });
    if (existingApplication) {
      return res.status(400).json({ message: 'Application already submitted' });
    }

    const documents = req.files.map(file => ({
      title: file.originalname,
      url: `/uploads/documents/${file.filename}`,
    }));

    const application = new TeacherApplication({
      userId: req.user._id,
      documents,
    });

    await application.save();
    res.status(201).json({ application });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher application status
router.get('/application', auth, async (req, res) => {
  try {
    const application = await TeacherApplication.findOne({ userId: req.user._id });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;