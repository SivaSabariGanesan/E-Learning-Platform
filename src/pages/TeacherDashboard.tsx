import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Video, Upload, FileText, Users } from 'lucide-react';
import api from '../api/axios';
import { Course } from '../types';
import VideoPlayer from '../components/Videoplayer';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({});
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [enrolledUsers, setEnrolledUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses/teacher/courses');
      setCourses(data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setError('Failed to fetch courses. Please try again.');
    }
  };

  const fetchEnrolledUsers = async (courseId: string) => {
    try {
      const { data } = await api.get(`/courses/${courseId}/enrollments`);
      setEnrolledUsers(data.enrollments);
      setShowEnrollmentsModal(true);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      setError('Failed to fetch enrolled users');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (currentCourse._id) {
        await api.put(`/courses/${currentCourse._id}`, currentCourse);
      } else {
        await api.post('/courses', currentCourse);
      }
      setShowModal(false);
      setCurrentCourse({});
      fetchCourses();
    } catch (error) {
      console.error('Failed to save course:', error);
      setError('Failed to save course. Please try again.');
    }
  };

  const handleDelete = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${courseId}`);
        fetchCourses();
      } catch (error) {
        console.error('Failed to delete course:', error);
        setError('Failed to delete course. Please try again.');
      }
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !videoTitle) {
      setError('Please provide both video title and file');
      return;
    }

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', videoTitle);
    formData.append('courseId', selectedCourseId);
    formData.append('order', '1');
    formData.append('isPreview', isPreview.toString());

    try {
      await api.post('/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setShowVideoModal(false);
      setVideoFile(null);
      setVideoTitle('');
      setIsPreview(false);
      fetchCourses();
    } catch (error) {
      console.error('Failed to upload video:', error);
      setError('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <button
          onClick={() => {
            setCurrentCourse({});
            setShowModal(true);
          }}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Course
        </button>
      </div>

      {/* Video Preview Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full">
            <div className="relative">
              <VideoPlayer
                url={selectedVideo}
                onEnded={() => setSelectedVideo(null)}
                className="aspect-video"
                height="auto"
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

      {/* Enrollments Modal */}
      {showEnrollmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Enrolled Students</h2>
              <button
                onClick={() => setShowEnrollmentsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {enrolledUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No students enrolled yet</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrolled Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrolledUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(user.enrolledAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={course.previewUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                <span className={`text-sm px-2 py-1 rounded ${course.price > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                  {course.price > 0 ? 'Paid' : 'Free'}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-indigo-600">
                  {course.price > 0 ? `₹${(course.price / 100).toFixed(2)}` : 'Free'}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchEnrolledUsers(course._id)}
                    className="text-gray-600 hover:text-indigo-600"
                    title="View Enrollments"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourseId(course._id);
                      setShowVideoModal(true);
                    }}
                    className="text-gray-600 hover:text-indigo-600"
                    title="Upload Video"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentCourse(course);
                      setShowModal(true);
                    }}
                    className="text-gray-600 hover:text-indigo-600"
                    title="Edit Course"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="text-gray-600 hover:text-red-600"
                    title="Delete Course"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {course.videos && course.videos.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Videos</h4>
                  <div className="space-y-2">
                    {course.videos.map((video) => (
                      <div key={video._id} className="flex items-center justify-between text-sm">
                        <button
                          onClick={() => setSelectedVideo(video.url)}
                          className="flex items-center text-gray-600 hover:text-indigo-600"
                        >
                          <Video className="w-4 h-4 mr-2 text-gray-500" />
                          {video.title}
                        </button>
                        {video.isPreview && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Preview
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              {currentCourse._id ? 'Edit Course' : 'Create Course'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={currentCourse.title || ''}
                  onChange={(e) => setCurrentCourse({ ...currentCourse, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={currentCourse.description || ''}
                  onChange={(e) => setCurrentCourse({ ...currentCourse, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={currentCourse.price === 0}
                      onChange={() => setCurrentCourse({ ...currentCourse, price: 0 })}
                      className="mr-2"
                    />
                    Free
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={currentCourse.price !== 0}
                      onChange={() => setCurrentCourse({ ...currentCourse, price: 100 })}
                      className="mr-2"
                    />
                    Paid
                  </label>
                </div>
              </div>
              {currentCourse.price !== 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (in ₹)
                  </label>
                  <input
                    type="number"
                    value={currentCourse.price ? currentCourse.price / 100 : ''}
                    onChange={(e) =>
                      setCurrentCourse({ ...currentCourse, price: Math.round(parseFloat(e.target.value) * 100) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview Image URL
                </label>
                <input
                  type="url"
                  value={currentCourse.previewUrl || ''}
                  onChange={(e) => setCurrentCourse({ ...currentCourse, previewUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {currentCourse._id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Upload Video</h2>
            <form onSubmit={handleVideoUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="video/mp4,video/webm"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">MP4 or WebM up to 100MB</p>
                  </div>
                </div>
                {videoFile && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected file: {videoFile.name}
                  </p>
                )}
              </div>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isPreview}
                    onChange={(e) => setIsPreview(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Make this video available as preview
                  </span>
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !videoFile}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center ${
                    uploading || !videoFile ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    'Upload Video'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;