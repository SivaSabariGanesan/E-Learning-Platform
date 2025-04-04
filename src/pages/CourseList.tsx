import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Star } from 'lucide-react';
import api from '../api/axios';
import { Course } from '../types';

const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setError(null);
      const { data } = await api.get('/courses');
      setCourses(data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setError('Failed to fetch courses. Please try again.');
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
          {error}
          <button
            onClick={fetchCourses}
            className="ml-4 text-sm underline hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
          <p className="mt-2 text-gray-600">Explore our wide range of courses and start learning today</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <Book className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No courses available</h3>
          <p className="mt-1 text-gray-500">Check back later for new courses</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <img
                src={course.previewUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600">4.5</span>
                  </div>
                  <span className="text-lg font-semibold text-indigo-600">
                    ₹{(course.price / 100).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/courses/${course._id}`)}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Book className="w-4 h-4 mr-2" />
                  View Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;