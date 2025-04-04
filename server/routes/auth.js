import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Initialize admin user if not exists
const initializeAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@eduplatform.com' });
    if (!adminExists) {
      const admin = new User({
        email: 'admin@eduplatform.com',
        password: 'admin123',
        name: 'Admin',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

initializeAdmin();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({ email, password, name, role });
    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Please authenticate' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
});

export default router;