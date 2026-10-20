import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import ResourceDetails from './pages/ResourceDetails';
import ListResource from './pages/ListResource';
import MyListings from './pages/MyListings';
import MyBorrowings from './pages/MyBorrowings';
import Profile from './pages/Profile';
import CampusImpact from './pages/CampusImpact';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-outfit">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/resources/:id" element={<ResourceDetails />} />
              <Route path="/impact" element={<CampusImpact />} />

              {/* Protected Student Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/list-resource" element={<ListResource />} />
                <Route path="/listings" element={<MyListings />} />
                <Route path="/borrowings" element={<MyBorrowings />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Fallback redirects */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800 text-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
              <p className="font-semibold text-slate-300">Campus Resource Exchange Platform &bull; Sustainable Sharing</p>
              <p className="text-slate-500">&copy; {new Date().getFullYear()} CampusShare Network. Built for college resource efficiency.</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
