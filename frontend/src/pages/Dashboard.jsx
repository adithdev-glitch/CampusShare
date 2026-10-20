import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LayoutDashboard, Package, ArrowLeftRight, Clock, ShieldAlert, Sparkles, BookOpen, UserCheck, Star } from 'lucide-react';

const Dashboard = () => {
  const { user, token, API_URL } = useAuth();
  
  const [stats, setStats] = useState({
    available: 0,
    myListings: 0,
    activeBorrowings: 0,
    pendingRequests: 0,
    overdue: 0
  });

  const [recommendations, setRecommendations] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [activeBorrowingsList, setActiveBorrowingsList] = useState([]);
  const [pendingRequestsList, setPendingRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };
        
        // 1. Fetch all resources
        const resAll = await axios.get(`${API_URL}/resources`);
        const allResources = resAll.data.resources || [];

        // 2. Fetch my listings
        const myListed = allResources.filter(r => r.ownerId?._id === user?.id);

        // 3. Fetch borrowings & requests
        const resBorrows = await axios.get(`${API_URL}/borrows/my-borrowings`, { headers });
        const borrowings = resBorrows.data.borrowings || [];
        const activeBorrowingsCount = borrowings.filter(b => b.status === 'borrowed').length;
        const overdueCount = borrowings.filter(b => b.status === 'overdue').length;
        
        const resRequests = await axios.get(`${API_URL}/borrows/my-requests`, { headers });
        const pending = resRequests.data.received.filter(r => r.status === 'pending');

        setStats({
          available: allResources.filter(r => r.availability).length,
          myListings: myListed.length,
          activeBorrowings: activeBorrowingsCount,
          pendingRequests: pending.length,
          overdue: overdueCount
        });

        // 4. Fetch recommendations
        const resRecs = await axios.get(`${API_URL}/resources/recommendations/all`, { headers });
        setRecommendations(resRecs.data.recommendations || []);

        // Sort recently added (limit to 4)
        const sortedRecent = [...allResources]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);
        setRecentlyAdded(sortedRecent);

        setActiveBorrowingsList(borrowings.filter(b => ['borrowed', 'overdue'].includes(b.status)));
        setPendingRequestsList(pending);

      } catch (err) {
        console.error('Fetch dashboard details failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Student Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Hello, {user?.name}. Here is a summary of your campus exchanges.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/list-resource"
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-102 cursor-pointer flex items-center space-x-1.5"
          >
            <span>Share a Resource</span>
          </Link>
          <Link
            to="/explore"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all hover:scale-102 cursor-pointer"
          >
            Request to Borrow
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Available Resources', val: stats.available, icon: <Package className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50/50', link: '/explore' },
          { label: 'My Listed Items', val: stats.myListings, icon: <LayoutDashboard className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50/50', link: '/listings?tab=listings' },
          { label: 'Active Borrowings', val: stats.activeBorrowings, icon: <ArrowLeftRight className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50/50', link: '/borrowings' },
          { label: 'Pending Requests', val: stats.pendingRequests, icon: <Clock className="w-5 h-5 text-violet-600" />, bg: 'bg-violet-50/50', link: '/listings?tab=requests' },
          { label: 'Overdue Items', val: stats.overdue, icon: <ShieldAlert className="w-5 h-5 text-rose-600" />, bg: 'bg-rose-50/50', link: '/borrowings' }
        ].map((stat, idx) => (
          <Link
            key={idx}
            to={stat.link}
            className={`bg-white p-5 rounded-2xl border border-slate-200/80 shadow-premium flex flex-col justify-between hover:scale-102 hover:shadow-indigo-500/5 hover:border-indigo-500/20 active:scale-98 transition-all duration-300`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.bg} flex-shrink-0`}>{stat.icon}</div>
            </div>
            <span className="text-3xl font-extrabold text-slate-900 mt-4 leading-none font-outfit">{stat.val}</span>
          </Link>
        ))}
      </div>

      {/* Active Borrowings & Pending Requests row (conditional display) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Active Borrowings */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white shadow-premium">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center space-x-1.5 font-outfit">
            <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
            <span>My Active Borrowings</span>
          </h3>
          {activeBorrowingsList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No active borrowings currently.
            </div>
          ) : (
            <div className="space-y-3">
              {activeBorrowingsList.map((borrow) => (
                <div key={borrow._id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={borrow.resourceId?.images[0]} 
                      alt="" 
                      className="w-10 h-10 rounded-lg object-cover" 
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{borrow.resourceId?.name}</h4>
                      <p className="text-[10px] text-slate-400">Owner: {borrow.ownerId?.name}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    borrow.status === 'overdue' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {borrow.status}
                  </span>
                </div>
              ))}
              <Link to="/borrowings" className="block text-center text-xs text-indigo-600 hover:text-indigo-700 font-bold mt-2">
                Manage borrowings and scan QR
              </Link>
            </div>
          )}
        </div>

        {/* Pending Requests Received */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white shadow-premium">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center space-x-1.5 font-outfit">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Pending Requests</span>
          </h3>
          {pendingRequestsList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No pending requests to approve.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequestsList.map((req) => (
                <div key={req._id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={req.resourceId?.images[0]} 
                      alt="" 
                      className="w-10 h-10 rounded-lg object-cover" 
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{req.resourceId?.name}</h4>
                      <p className="text-[10px] text-slate-400">Borrower: {req.borrowerId?.name}</p>
                    </div>
                  </div>
                  <Link 
                    to="/listings" 
                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg transition-colors"
                  >
                    Respond
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="mb-10">
        <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center space-x-2 font-outfit">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>Recommended for You</span>
        </h3>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 border border-slate-100 rounded-2xl bg-white text-xs text-slate-400">
            No recommendations available. Fill in your wishlist or borrow items to trigger recommended matches.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((item) => (
              <Link 
                key={item._id} 
                to={`/resources/${item._id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-premium hover:shadow-indigo-500/5 hover:border-indigo-500/20 hover:scale-102 transition-all overflow-hidden flex flex-col group duration-300"
              >
                <img 
                  src={item.images[0]} 
                  alt={item.name} 
                  className="w-full h-36 object-cover bg-slate-100" 
                />
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase">{item.category}</span>
                    <h4 className="font-bold text-xs text-slate-800 mt-2 truncate group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-slate-50 pt-3">
                    <span className="text-[10px] text-slate-400">Owner: {item.ownerId?.name.split(' ')[0]}</span>
                    <div className="flex items-center space-x-0.5 text-xs font-bold text-yellow-500">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      <span>{item.ownerId?.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recently Added Section */}
      <div>
        <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center space-x-2 font-outfit">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span>Recently Added Items</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentlyAdded.map((item) => (
            <Link 
              key={item._id} 
              to={`/resources/${item._id}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-premium hover:shadow-indigo-500/5 hover:border-indigo-500/20 hover:scale-102 transition-all overflow-hidden flex flex-col group duration-300"
            >
              <img 
                src={item.images[0]} 
                alt={item.name} 
                className="w-full h-36 object-cover bg-slate-100" 
              />
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{item.category}</span>
                  <h4 className="font-bold text-xs text-slate-800 mt-2 truncate group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-slate-50 pt-3">
                  <span className="text-[10px] text-slate-400">Location: {item.location}</span>
                  <span className={`text-[9px] font-bold ${item.availability ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {item.availability ? 'Available Now' : 'Borrowed'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
