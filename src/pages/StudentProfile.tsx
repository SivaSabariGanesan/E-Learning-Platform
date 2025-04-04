import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { Course } from '../types';
import { User, BookOpen, Calendar, DollarSign, Clock } from 'lucide-react';

const StudentProfile = () => {
  const { user } = useAuthStore();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [completionStats, setCompletionStats] = useState({
    completed: 0,
    inProgress: 0,
    notStarted: 0
  });

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const { data } = await api.get('/courses/enrolled');
      setEnrolledCourses(data.courses);
      
      // Calculate total spent
      const total = data.courses.reduce((acc: number, course: Course) => acc + course.price, 0);
      setTotalSpent(total);

      // Fetch progress for completion stats
      const { data: progressData } = await api.get('/progress');
      
      const stats = data.courses.reduce((acc: any, course: Course) => {
        const courseProgress = progressData.progress.filter((p: any) => p.courseId === course._id);
        const completedVideos = courseProgress.filter((p: any) => p.completed).length;
        const totalVideos = course.videos.length;

        if (completedVideos === 0) {
          acc.notStarted++;
        } else if (completedVideos === totalVideos) {
          acc.completed++;
        } else {
          acc.inProgress++;
        }
        return acc;
      }, { completed: 0, inProgress: 0, notStarted: 0 });

      setCompletionStats(stats);
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-indigo-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-full">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-indigo-200">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹{(totalSpent / 100).toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed Courses</p>
                <p className="text-2xl font-bold text-gray-900">{completionStats.completed}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{completionStats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Enrolled Courses Section */}
        <div className="p-6 border-t">
          <h2 className="text-xl font-semibold mb-4">Enrolled Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const progress = course.videos.length > 0
                ? (completionStats.completed / course.videos.length) * 100
                : 0;

              return (
                <div key={course._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        by {course.teacherId.name}
                      </p>
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                      {course.price > 0 ? `₹${(course.price / 100).toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <a
                    href={`/courses/${course._id}`}
                    className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-flex items-center"
                  >
                    Continue Learning
                    <svg
                      className="w-4 h-4 ml-1"
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
                  </a>
                </div>
              );
            })}
          </div>

          {enrolledCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No courses yet</h3>
              <p className="mt-1 text-gray-500">Start your learning journey by enrolling in a course</p>
              <a
                href="/courses"
                className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
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
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;