import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, AlertCircle, FileText, Clock, X } from 'lucide-react';
import api from '../api/axios';

const TeacherApplication = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const { data } = await api.get('/teacher/application');
      setApplication(data.application);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        setError('Failed to fetch application status');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError('Please select at least one document');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('documents', file);
    });

    try {
      const { data } = await api.post('/teacher/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      setApplication(data.application);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  if (application) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Application Status</h1>
          
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              {getStatusIcon(application.status)}
              <span className={`font-semibold capitalize ${getStatusColor(application.status)}`}>
                {application.status}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Submitted Documents</h2>
            <div className="grid gap-4">
              {application.documents.map((doc: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{doc.title}</span>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>

          {application.status === 'rejected' && (
            <div className="mt-6 p-4 bg-red-50 rounded-md">
              <p className="text-red-700">
                Your application has been rejected. You may submit a new application with updated documents.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Teacher Application</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Required Documents</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Professional certification or teaching credentials</li>
            <li>Resume or CV highlighting teaching experience</li>
            <li>Sample course outline or teaching methodology</li>
            <li>Any additional relevant certifications</li>
          </ul>
        </div>

        {success ? (
          <div className="bg-green-50 p-4 rounded-md flex items-center">
            <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
            <div>
              <h3 className="text-green-800 font-medium">Application Submitted Successfully!</h3>
              <p className="text-green-600">Redirecting to dashboard...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Documents
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="documents"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="documents"
                        name="documents"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={(e) => setFiles(e.target.files)}
                        accept=".pdf,.doc,.docx"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC up to 5MB each (max 5 files)
                  </p>
                </div>
              </div>
              {files && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
                  <ul className="mt-1 text-sm text-gray-500">
                    {Array.from(files).map((file, index) => (
                      <li key={index} className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-md flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TeacherApplication;