import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Course, Progress } from '../types';
import api from '../api/axios';
import { BookOpen, Clock, CheckCircle, Play } from 'lucide-react';
import ReactPlayer from 'react-player';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const { data } = await api.get('/courses/enrolled');
        setEnrolledCourses(data.courses);
      } catch (error) {
        console.error('Failed to fetch enrolled courses:', error);
      }
    };

    const fetchProgress = async () => {
      try {
        const { data } = await api.get('/progress');
        setProgress(data.progress);
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      }
    };

    fetchEnrolledCourses();
    fetchProgress();
  }, []);

  const calculateProgress = (courseId: string) => {
    const courseProgress = progress.filter((p) => p.courseId === courseId);
    const completedVideos = courseProgress.filter((p) => p.completed).length;
    const course = enrolledCourses.find((c) => c._id === courseId);
    const totalVideos = course?.videos.length || 0;
    return totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
  };

  const handleVideoComplete = async (courseId: string, videoId: string) => {
    try {
      await api.post('/progress', {
        courseId,
        videoId,
        completed: true,
      });
      const { data } = await api.get('/progress');
      setProgress(data.progress);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Track your learning progress and continue your courses.</p>
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full">
            <div className="relative">
              <ReactPlayer
                url={selectedVideo}
                width="100%"
                height="auto"
                controls
                playing
                onEnded={() => setSelectedVideo(null)}
                className="aspect-video"
              />
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((course) => {
          const progressPercent = calculateProgress(course._id);
          const previewVideo = course.videos.find(video => video.isPreview);
          
          return (
            <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={course.previewUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                {previewVideo && (
                  <button
                    onClick={() => setSelectedVideo(previewVideo.url)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-75 transition-opacity"
                  >
                    <Play className="w-16 h-16 text-white" />
                  </button>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.videos.length} videos
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {progressPercent.toFixed(0)}% complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <Link
                  to={`/courses/${course._id}`}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Continue Learning
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {enrolledCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course.</p>
          <Link
            to="/courses"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            Browse Courses
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;