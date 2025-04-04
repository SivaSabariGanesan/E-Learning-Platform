import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn, Info } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAdminInfo, setShowAdminInfo] = useState(false);
  const { signIn } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-8">
          <LogIn className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-8">Welcome Back</h2>
        
        {/* Admin Info Button */}
        <button
          onClick={() => setShowAdminInfo(!showAdminInfo)}
          className="mb-4 text-sm text-indigo-600 hover:text-indigo-500 flex items-center justify-center w-full"
        >
          <Info className="w-4 h-4 mr-1" />
          {showAdminInfo ? 'Hide Admin Info' : 'Show Admin Info'}
        </button>

        {/* Admin Credentials Info */}
        {showAdminInfo && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold text-gray-700 mb-2">Admin Credentials:</h3>
            <p className="text-sm text-gray-600">Email: admin@eduplatform.com</p>
            <p className="text-sm text-gray-600">Password: admin123</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
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
          <div className="mb-6">
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
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 space-y-2">
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-500">
              Register here
            </Link>
          </p>
          <p className="text-center text-sm text-gray-600">
            Want to become a teacher?{' '}
            <Link
              to="/register?role=teacher"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Register as Teacher
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;