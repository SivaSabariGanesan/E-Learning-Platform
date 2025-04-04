import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserPlus, Upload, FileText } from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const { signUp } = useAuthStore();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'teacher') {
      setRole('teacher');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      if (role === 'teacher' && (!files || files.length === 0)) {
        setError('Please upload required documents');
        setUploading(false);
        return;
      }

      // Register user first
      await signUp(email, password, role, name);

      // If teacher role, submit documents
      if (role === 'teacher' && files) {
        const formData = new FormData();
        Array.from(files).forEach((file) => {
          formData.append('documents', file);
        });

        await api.post('/teacher/apply', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-8">
          <UserPlus className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-8">Create Account</h2>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I want to
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="student"
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value as 'student')}
                  className="mr-2"
                />
                Learn
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="teacher"
                  checked={role === 'teacher'}
                  onChange={(e) => setRole(e.target.value as 'teacher')}
                  className="mr-2"
                />
                Teach
              </label>
            </div>
          </div>

          {role === 'teacher' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Documents
              </label>
              <div className="text-sm text-gray-600 mb-4">
                <ul className="list-disc list-inside space-y-1">
                  <li>Professional certification or teaching credentials</li>
                  <li>Resume or CV</li>
                  <li>Sample course outline</li>
                </ul>
              </div>
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
              {files && files.length > 0 && (
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
          )}

          <button
            type="submit"
            disabled={uploading}
            className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;