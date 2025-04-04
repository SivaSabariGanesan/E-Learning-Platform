import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetails from './pages/CourseDetails';
import TeacherApplication from './pages/TeacherApplication';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentProfile from './pages/StudentProfile';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route
              path="/dashboard"
              element={
                user ? (
                  user.role === 'admin' ? (
                    <AdminDashboard />
                  ) : user.role === 'teacher' ? (
                    <TeacherDashboard />
                  ) : (
                    <Dashboard />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route
              path="/profile"
              element={
                user ? <StudentProfile /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/teacher-application"
              element={
                user?.role === 'teacher' ? (
                  <TeacherApplication />
                ) : (
                  <Navigate to="/dashboard" />
                )
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;