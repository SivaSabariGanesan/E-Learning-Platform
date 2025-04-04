import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">EduPlatform</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/courses"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Courses
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Dashboard
                </Link>
                {user.role === 'student' && (
                  <Link
                    to="/profile"
                    className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <User className="h-5 w-5 mr-1" />
                    <span>Profile</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;