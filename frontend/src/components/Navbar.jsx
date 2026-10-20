import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User, LayoutDashboard, Globe, Shield, Search, Menu, X, Check, Heart } from 'lucide-react';

const Navbar = () => {
  const {
    user,
    logout,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-navbar sticky top-0 z-50 w-full bg-white/80 border-b border-slate-200/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all">
                <Globe className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-outfit">
                Campus<span className="text-indigo-600">Share</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user ? (
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/dashboard') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/explore"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/explore') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
              >
                Explore Resources
              </Link>
              <Link
                to="/listings"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/listings') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
              >
                My Listings
              </Link>
              <Link
                to="/borrowings"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/borrowings') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
              >
                My Borrowings
              </Link>
              <Link
                to="/impact"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/impact') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
              >
                Campus Impact
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 transition-all ${isActive('/admin') ? 'bg-rose-50' : 'hover:bg-rose-50/50'
                    }`}
                >
                  Admin Panel
                </Link>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/explore" className="text-slate-600 hover:text-slate-950 font-medium text-sm transition-colors">
                Explore Resources
              </Link>
              <Link to="/impact" className="text-slate-600 hover:text-slate-950 font-medium text-sm transition-colors">
                Campus Impact
              </Link>
            </div>
          )}

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {/* Wishlist Link */}
                <Link
                  to={`/profile/${user.id}?tab=wishlist`}
                  className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-100/80 rounded-xl transition-all relative cursor-pointer flex items-center justify-center"
                  title="My Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {user.wishlist && user.wishlist.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </Link>

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl transition-all relative cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200/80 shadow-premium z-50 py-2">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                        <span className="font-bold text-sm text-slate-800">Notifications</span>
                        {unreadNotificationsCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => {
                                markNotificationRead(notif._id);
                                setNotifDropdownOpen(false);
                              }}
                              className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-2.5 ${!notif.read ? 'bg-indigo-50/20' : ''
                                }`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.read ? 'bg-indigo-600' : 'bg-transparent'
                                }`} />
                              <div className="flex-col">
                                <p className="text-xs text-slate-700 leading-normal">{notif.message}</p>
                                <span className="text-[10px] text-slate-400 block mt-1">
                                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Avatar Trigger */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer"
                  >
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-indigo-100 object-cover"
                    />
                    <span className="text-sm font-semibold text-slate-700">{user.name.split(' ')[0]}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200/80 shadow-premium z-50 py-2">
                      <Link
                        to={`/profile/${user.id}`}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50/50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/10 hover:scale-102 active:scale-98 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2">
          {user ? (
            <>
              <div className="flex items-center space-x-3 py-3 border-b border-slate-100 mb-3">
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-indigo-100 object-cover"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-bold ${isActive('/dashboard') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}
              >
                Dashboard
              </Link>
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-bold ${isActive('/explore') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}
              >
                Explore Resources
              </Link>
              <Link
                to="/listings"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-bold ${isActive('/listings') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}
              >
                My Listings
              </Link>
              <Link
                to="/borrowings"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-bold ${isActive('/borrowings') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}
              >
                My Borrowings
              </Link>
              <Link
                to={`/profile/${user.id}?tab=wishlist`}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-bold flex justify-between items-center ${location.search.includes('tab=wishlist') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'
                  }`}
              >
                <span>My Wishlist</span>
                {user.wishlist && user.wishlist.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold">
                    {user.wishlist.length}
                  </span>
                )}
              </Link>
              <Link
                to="/impact"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-bold ${isActive('/impact') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}
              >
                Campus Impact
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-bold ${isActive('/admin') ? 'bg-rose-50 text-rose-600' : 'text-rose-600'}`}
                >
                  Admin Panel
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                Explore Resources
              </Link>
              <Link
                to="/impact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                Campus Impact
              </Link>
              <div className="h-[1px] bg-slate-100 my-2"></div>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-3 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-3 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
