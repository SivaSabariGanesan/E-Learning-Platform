import React, { useEffect, useState } from 'react';
import { TeacherApplication, Course } from '../types';
import api from '../api/axios';
import { CheckCircle, XCircle, Clock, BookOpen, Check } from 'lucide-react';

const AdminDashboard = () => {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'applications' | 'courses'>('applications');

  useEffect(() => {
    fetchApplications();
    fetchCourses();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/admin/teacher-applications');
      setApplications(data.applications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/admin/courses');
      setCourses(data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/admin/teacher-applications/${applicationId}`, { status });
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status } : app
      ));
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  const handleCourseApproval = async (courseId: string) => {
    try {
      const { data } = await api.put(`/admin/courses/${courseId}/approve`);
      setCourses(courses.map(course => 
        course._id === courseId ? data.course : course
      ));
    } catch (error) {
      console.error('Failed to approve course:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex space-x-4 border-b">
          <button
            className={`py-2 px-4 ${
              activeTab === 'applications'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('applications')}
          >
            Teacher Applications
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'courses'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('courses')}
          >
            Course Management
          </button>
        </div>
      </div>

      {activeTab === 'applications' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {application.userId.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.userId.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {application.documents.map((doc, index) => (
                          <a
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Document {index + 1}
                          </a>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(application.status)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {application.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {application.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApplicationStatus(application._id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApplicationStatus(application._id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {course.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        ₹{(course.price / 100).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {course.teacherId.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {course.teacherId.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {course.isApproved ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="ml-2 text-sm text-gray-900">
                          {course.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {course.approvedBy ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {course.approvedBy.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(course.approvedAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {!course.isApproved && (
                        <button
                          onClick={() => handleCourseApproval(course._id)}
                          className="flex items-center text-green-600 hover:text-green-900"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;