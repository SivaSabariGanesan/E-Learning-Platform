import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import videoRoutes from './routes/videos.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import teacherRoutes from './routes/teachers.js';
import progressRoutes from './routes/progress.js';  

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Create uploads directory if it doesn't exist
import { mkdirSync } from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
const documentsDir = path.join(uploadsDir, 'documents');
mkdirSync(uploadsDir, { recursive: true });
mkdirSync(documentsDir, { recursive: true });

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/progress', progressRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});