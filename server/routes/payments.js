import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import auth from '../middleware/auth.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: "rzp_test_S5BWwk1EVTJfWr",
  key_secret: "lSGyItH8WD3VOMIsiu1VdLAL",
});


// Create order
router.post('/create-order', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const options = {
      amount: course.price * 100, // Convert to paise
      currency: 'INR',
      receipt: `course_${course._id}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
      return res.status(400).json({ message: 'Missing required payment parameters' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Verify the payment with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.status !== 'captured') {
      return res.status(400).json({ message: 'Payment not captured' });
    }

    // Enroll user in the course
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }
      
    res.json({ message: 'Payment successful and course enrolled' });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

export default router;