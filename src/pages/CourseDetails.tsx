import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { Course, Video } from '../types';
import { Play, Lock } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseDetails();
    checkEnrollment();

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data.course);
      if (data.course.videos && data.course.videos.length > 0) {
        setVideos(data.course.videos);
        const previewVideo = data.course.videos.find(v => v.isPreview);
        setCurrentVideo(previewVideo || data.course.videos[0]);
      }
    } catch (error) {
      console.error('Failed to fetch course details:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/courses/enrolled');
      const isEnrolled = data.courses.some((course: Course) => course._id === id);
      setEnrolled(isEnrolled);
    } catch (error) {
      console.error('Failed to check enrollment:', error);
    }
  };

  const handleVideoComplete = async (videoId: string) => {
    try {
      await api.post('/progress', {
        courseId: id,
        videoId,
        completed: true
      });
      fetchCourseDetails();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handlePayment = async () => {
    if (!course || !user) {
      setError('Please log in to enroll in this course');
      return;
    }

    if (course.price === 0) {
      try {
        await api.post('/courses/enroll', { courseId: id });
        setEnrolled(true);
        setError(null);
      } catch (error) {
        console.error('Failed to enroll in free course:', error);
        setError('Failed to enroll in the course. Please try again.');
      }
      return;
    }

    setLoadingPayment(true);
    setError(null);

    try {
      const { data: orderData } = await api.post('/payments/create-order', { courseId: id });
      
      if (!orderData.order || !orderData.order.id) {
        throw new Error('Invalid order response');
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay key not configured');
      }

      const options = {
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: "INR",
        name: "EduPlatform",
        description: `Enrollment for ${course.title}`,
        order_id: orderData.order.id,
        handler: async (response: any) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: id
            });
            setEnrolled(true);
            setError(null);
            checkEnrollment();
          } catch (error) {
            console.error('Payment verification failed:', error);
            setError('Payment verification failed. Please contact support if payment was deducted.');
          }
        },
        prefill: {
          email: user.email,
          name: user.name
        },
        theme: {
          color: "#4F46E5"
        },
        modal: {
          ondismiss: function() {
            setLoadingPayment(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Failed to create order:', error);
      setError(error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoadingPayment(false);
    }
  };

  const canWatchVideo = (video: Video) => {
    return enrolled || video.isPreview || course?.price === 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          Course not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <VideoPlayer
            url={currentVideo?.url || null}
            isLocked={!currentVideo || !canWatchVideo(currentVideo)}
            lockMessage={user ? 'Enroll to watch this video' : 'Please log in to enroll'}
            height="500px"
            onEnded={() => currentVideo && handleVideoComplete(currentVideo._id)}
          />
          <div className="mt-6">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="mt-4 text-gray-600">{course.description}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>
          {!enrolled && course.price > 0 && (
            <div className="mb-6">
              <div className="text-2xl font-bold text-indigo-600 mb-4">
                ₹{(course.price / 100).toFixed(2)}
              </div>
              {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handlePayment}
                disabled={loadingPayment || !user}
                className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center ${
                  (loadingPayment || !user) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loadingPayment ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : !user ? (
                  'Login to Enroll'
                ) : (
                  'Enroll Now'
                )}
              </button>
            </div>
          )}
          <div className="space-y-2">
            {videos.map((video) => (
              <button
                key={video._id}
                onClick={() => setCurrentVideo(video)}
                disabled={!canWatchVideo(video)}
                className={`w-full flex items-center justify-between p-3 rounded-md ${
                  currentVideo?._id === video._id
                    ? 'bg-indigo-50 text-indigo-600'
                    : canWatchVideo(video)
                    ? 'hover:bg-gray-50'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center">
                  {canWatchVideo(video) ? (
                    <Play className="w-5 h-5 mr-2" />
                  ) : (
                    <Lock className="w-5 h-5 mr-2" />
                  )}
                  <span className="text-left">{video.title}</span>
                </div>
                {video.isPreview && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Preview
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;