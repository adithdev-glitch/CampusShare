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
    <div className="sticky top-0 z-50 w-full flex justify-center px-4 pt-4 pb-2 pointer-events-none">
      <nav
        className="pointer-events-auto w-full max-w-4xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-200/60 rounded-full px-4 py-2.5 flex items-center justify-between"
        style={{ boxShadow: '0 4px 24px 0 rgba(30,30,60,0.08), 0 1.5px 6px 0 rgba(30,30,60,0.04)' }}
      >
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
          <div className="bg-slate-900 p-1.5 rounded-lg text-white group-hover:scale-105 transition-all">
            <Globe className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">
            Campus<span className="text-indigo-600">Share</span>
          </span>
        </Link>

        {/* Desktop Navigation — center */}
        {user ? (
          <div className="hidden md:flex items-center space-x-0.5 mx-4">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/dashboard') ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'}`}
            >
              Dashboard
            </Link>
            <Link
              to="/explore"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/explore') ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'}`}
            >
              Explore
            </Link>
            <Link
              to="/listings"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/listings') ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'}`}
            >
              My Listings
            </Link>
            <Link
              to="/borrowings"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/borrowings') ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'}`}
            >
              Borrowings
            </Link>
            <Link
              to="/impact"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/impact') ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'}`}
            >
              Impact
            </Link>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-full text-sm font-medium text-rose-500 transition-all ${isActive('/admin') ? 'bg-rose-50' : 'hover:bg-rose-50/60'}`}
              >
                Admin
              </Link>
            )}
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-0.5 mx-4">
            <Link
              to="/explore"
              className="px-3 py-1.5 rounded-full text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 transition-all"
            >
              Explore
            </Link>
            <Link
              to="/impact"
              className="px-3 py-1.5 rounded-full text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 transition-all"
            >
              Impact
            </Link>
          </div>
        )}

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
          {user ? (
            <>
              {/* Wishlist */}
              <Link
                to={`/profile/${user.id}?tab=wishlist`}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100/80 rounded-full transition-all relative"
                title="My Wishlist"
              >
                <Heart className="w-4 h-4" />
                {user.wishlist && user.wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </Link>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-full transition-all relative cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200/80 shadow-xl z-50 py-2">
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
                        <div className="px-4 py-6 text-center text-xs text-slate-400">No notifications yet.</div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => { markNotificationRead(notif._id); setNotifDropdownOpen(false); }}
                            className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-2.5 ${!notif.read ? 'bg-indigo-50/20' : ''}`}
                          >
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.read ? 'bg-indigo-600' : 'bg-transparent'}`} />
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

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 pl-1 pr-3 py-1 hover:bg-slate-100/80 rounded-full transition-all cursor-pointer"
                >
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                  />
                  <span className="text-sm font-semibold text-slate-700">{user.name.split(' ')[0]}</span>
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl border border-slate-200/80 shadow-xl z-50 py-2">
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
                className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer — outside pill, full-width */}
      {mobileMenuOpen && (
        <div
          className="pointer-events-auto absolute left-4 right-4 top-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-2xl px-4 pt-3 pb-6 space-y-1"
          style={{ boxShadow: '0 8px 32px 0 rgba(30,30,60,0.12)' }}
        >
          {user ? (
            <>
              <div className="flex items-center space-x-3 py-3 border-b border-slate-100 mb-2">
                <img src={user.profileImage} alt={user.name} className="w-9 h-9 rounded-full border border-slate-200 object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/explore', label: 'Explore Resources' },
                { to: '/listings', label: 'My Listings' },
                { to: '/borrowings', label: 'My Borrowings' },
                { to: '/impact', label: 'Campus Impact' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-medium ${isActive(to) ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {label}
                </Link>
              ))}
              <Link
                to={`/profile/${user.id}?tab=wishlist`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex justify-between items-center px-3 py-2 rounded-xl text-sm font-medium ${location.search.includes('tab=wishlist') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span>My Wishlist</span>
                {user.wishlist && user.wishlist.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold">{user.wishlist.length}</span>
                )}
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50"
                >
                  Admin Panel
                </Link>
              )}
              <div className="h-px bg-slate-100 my-2" />
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/explore" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl">Explore Resources</Link>
              <Link to="/impact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl">Campus Impact</Link>
              <div className="h-px bg-slate-100 my-2" />
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center px-3 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl">Get Started</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
