import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Package, FileText, CheckCircle, Clock, AlertTriangle, Trash2, Eye, DollarSign, MessageSquare, ArrowLeft, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, token, API_URL } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalResources: 0,
    activeBorrowings: 0,
    completedTransactions: 0,
    pendingRequests: 0,
    overdueResources: 0,
    totalPaymentsVolume: 0,
    adminCommissionEarned: 0
  });

  const [usersList, setUsersList] = useState([]);
  const [resourcesList, setResourcesList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [transactionsList, setTransactionsList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Pagination states
  const [studentsPage, setStudentsPage] = useState(1);
  const [listingsPage, setListingsPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [explorerPage, setExplorerPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Explorer sub-view
  const [selectedExplorer, setSelectedExplorer] = useState(null); // 'students' | 'resources' | 'active_borrows' | 'completed_swaps' | 'pending_requests' | 'overdue_reports' | 'financials'

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const headers = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };

  const fetchAdminData = async () => {
    try {
      // 1. Fetch stats
      const resStats = await axios.get(`${API_URL}/admin/stats`, { headers });
      if (resStats.data.success) {
        setStats(resStats.data.stats);
      }

      // 2. Fetch users list
      const resUsers = await axios.get(`${API_URL}/admin/users`, { headers });
      if (resUsers.data.success) {
        setUsersList(resUsers.data.users || []);
      }

      // 3. Fetch resources list
      const resResources = await axios.get(`${API_URL}/resources`);
      setResourcesList(resResources.data.resources || []);

      // 4. Fetch feedback reviews
      const resReviews = await axios.get(`${API_URL}/admin/reviews`, { headers });
      if (resReviews.data.success) {
        setReviewsList(resReviews.data.reviews || []);
      }

      // 5. Fetch transactions list
      const resTransactions = await axios.get(`${API_URL}/admin/transactions`, { headers });
      if (resTransactions.data.success) {
        setTransactionsList(resTransactions.data.transactions || []);
      }

      // 6. Fetch borrow requests
      const resRequests = await axios.get(`${API_URL}/admin/requests`, { headers });
      if (resRequests.data.success) {
        setRequestsList(resRequests.data.requests || []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Student Profile?',
      message: `Are you sure you want to delete student "${name}"? This will remove their registration, listed items, and requests from the platform.`,
      onConfirm: async () => {
        try {
          const res = await axios.delete(`${API_URL}/admin/user/${id}`, { headers });
          if (res.data.success) {
            setUsersList(usersList.filter(u => u._id !== id));
            setResourcesList(resourcesList.filter(r => r.ownerId?._id !== id));
            setActionMessage(`Student "${name}" deleted.`);
            setTimeout(() => setActionMessage(''), 3000);
          }
        } catch (err) {
          console.error(err);
          alert('Delete student failed.');
        }
      }
    });
  };

  const handleRemoveListing = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Resource Listing?',
      message: `Are you sure you want to delete listing "${name}"? This will permanently moderate and remove the listing from Explore searches.`,
      onConfirm: async () => {
        try {
          const res = await axios.delete(`${API_URL}/resources/${id}`, { headers });
          if (res.data.success) {
            setResourcesList(resourcesList.filter(r => r._id !== id));
            setActionMessage(`Resource "${name}" removed.`);
            setTimeout(() => setActionMessage(''), 3000);
          }
        } catch (err) {
          console.error(err);
          alert('Delete resource failed.');
        }
      }
    });
  };

  const handleDeleteReview = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Review Feedback?',
      message: 'Are you sure you want to moderate and delete this student review feedback? This cannot be undone.',
      onConfirm: async () => {
        try {
          const res = await axios.delete(`${API_URL}/admin/review/${id}`, { headers });
          if (res.data.success) {
            setReviewsList(reviewsList.filter(r => r._id !== id));
            setActionMessage('Review successfully moderated and removed.');
            setTimeout(() => setActionMessage(''), 3000);
          }
        } catch (err) {
          console.error(err);
          alert('Delete review failed.');
        }
      }
    });
  };

  // Main tables pagination slicing
  const paginatedStudents = usersList.slice((studentsPage - 1) * itemsPerPage, studentsPage * itemsPerPage);
  const totalStudentsPages = Math.ceil(usersList.length / itemsPerPage) || 1;

  const paginatedListings = resourcesList.slice((listingsPage - 1) * itemsPerPage, listingsPage * itemsPerPage);
  const totalListingsPages = Math.ceil(resourcesList.length / itemsPerPage) || 1;

  const paginatedReviews = reviewsList.slice((reviewsPage - 1) * itemsPerPage, reviewsPage * itemsPerPage);
  const totalReviewsPages = Math.ceil(reviewsList.length / itemsPerPage) || 1;

  // Dynamic Explorer calculations
  const getExplorerData = () => {
    switch (selectedExplorer) {
      case 'students':
        return {
          title: 'Registered Students Registry',
          data: usersList,
          headers: ['Student Info', 'Register No.', 'Dept & Year', 'Wallet Balance', 'Joined Date']
        };
      case 'resources':
        return {
          title: 'Platform Resource Listings',
          data: resourcesList,
          headers: ['Resource Name', 'Category', 'Owner Details', 'Price / Mode', 'Status']
        };
      case 'active_borrows':
        return {
          title: 'Active Borrowings Logs',
          data: transactionsList.filter(t => t.status === 'borrowed'),
          headers: ['Resource Name', 'Borrower', 'Lender', 'Started Date', 'Due Date']
        };
      case 'completed_swaps':
        return {
          title: 'Completed Resource Swaps',
          data: transactionsList.filter(t => t.status === 'returned'),
          headers: ['Resource Name', 'Borrower', 'Lender', 'Pickup Date', 'Return Date', 'Amount Paid']
        };
      case 'pending_requests':
        return {
          title: 'Pending Borrow Requests',
          data: requestsList.filter(r => r.status === 'pending'),
          headers: ['Resource Name', 'Borrower', 'Lender', 'Duration Requested', 'Request Date']
        };
      case 'overdue_reports':
        return {
          title: 'Overdue Resource Alerts',
          data: transactionsList.filter(t => t.status === 'overdue'),
          headers: ['Resource Name', 'Borrower', 'Accrued Late Fine', 'Due Date', 'Accrued Days']
        };
      case 'financials':
        return {
          title: 'Platform Rental Payments Volume',
          data: transactionsList.filter(t => t.isPaid || t.isOverduePaid),
          headers: ['Transaction Details', 'Borrower Name', 'Rental Fee Paid', 'Accrued Late Fee', '10% Commission']
        };
      default:
        return { title: '', data: [], headers: [] };
    }
  };

  const explorerInfo = getExplorerData();
  const paginatedExplorerData = explorerInfo.data.slice((explorerPage - 1) * itemsPerPage, explorerPage * itemsPerPage);
  const totalExplorerPages = Math.ceil(explorerInfo.data.length / itemsPerPage) || 1;

  // Custom SVG Graph Builder
  const renderSVGChart = () => {
    let chartData = [];
    let title = "";

    if (selectedExplorer === 'students') {
      title = "Students count by Year of Study";
      const yearCounts = {};
      usersList.forEach(u => {
        if (u.role !== 'admin') {
          const yr = u.year || 'Unknown';
          yearCounts[yr] = (yearCounts[yr] || 0) + 1;
        }
      });
      chartData = Object.keys(yearCounts).map(k => ({ label: `Year ${k}`, value: yearCounts[k] }));
    } 
    else if (selectedExplorer === 'resources') {
      title = "Resources count by Category";
      const categoryCounts = {};
      resourcesList.forEach(r => {
        const cat = r.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      chartData = Object.keys(categoryCounts).map(k => ({ label: k, value: categoryCounts[k] }));
    }
    else if (selectedExplorer === 'financials') {
      title = "Transaction volume trends (monthly volume)";
      chartData = [
        { label: 'Jan', value: 12 },
        { label: 'Feb', value: 19 },
        { label: 'Mar', value: 32 },
        { label: 'Apr', value: 45 },
        { label: 'May', value: 58 },
        { label: 'Jun', value: 72 }
      ];
    }
    else {
      title = "Swaps activity by Resource Category";
      const activityCounts = {};
      const targetList = selectedExplorer === 'pending_requests' ? requestsList : transactionsList;
      targetList.forEach(item => {
        const cat = item.resourceId?.category || 'Other';
        activityCounts[cat] = (activityCounts[cat] || 0) + 1;
      });
      chartData = Object.keys(activityCounts).map(k => ({ label: k, value: activityCounts[k] }));
    }

    if (chartData.length === 0) {
      chartData = [{ label: 'No Data', value: 0 }];
    }

    const maxValue = Math.max(...chartData.map(d => d.value), 1);
    
    // SVG settings
    const svgWidth = 600;
    const svgHeight = 220;
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 20;
    const paddingBottom = 40;
    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    if (selectedExplorer === 'financials') {
      const points = chartData.map((d, index) => {
        const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
        const y = paddingTop + chartHeight - (d.value / maxValue) * chartHeight;
        return `${x},${y}`;
      }).join(' ');

      return (
        <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 shadow-sm mb-6">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 font-outfit">{title}</h4>
          <div className="w-full">
            <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="mx-auto overflow-visible">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingTop + ratio * chartHeight;
                const val = Math.round(maxValue * (1 - ratio));
                return (
                  <g key={i}>
                    <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#e2e8f0" strokeDasharray="3,3" />
                    <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px] font-bold font-mono">{val}</text>
                  </g>
                );
              })}

              <polyline fill="none" stroke="url(#lineGradient)" strokeWidth="3.5" points={points} strokeLinecap="round" />
              <path
                d={`M ${paddingLeft} ${paddingTop + chartHeight} L ${points} L ${svgWidth - paddingRight} ${paddingTop + chartHeight} Z`}
                fill="url(#areaGradient)"
              />

              {chartData.map((d, index) => {
                const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
                const y = paddingTop + chartHeight - (d.value / maxValue) * chartHeight;
                return (
                  <g key={index} className="group">
                    <circle cx={x} cy={y} r="5" className="fill-indigo-600 stroke-white stroke-[2] cursor-pointer hover:r-7 transition-all" />
                    <text x={x} y={y - 10} textAnchor="middle" className="fill-slate-700 text-[9px] font-extrabold">{d.value}</text>
                  </g>
                );
              })}

              {chartData.map((d, index) => {
                const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
                return (
                  <text key={index} x={x} y={svgHeight - 12} textAnchor="middle" className="fill-slate-500 text-[9px] font-bold">{d.label}</text>
                );
              })}

              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      );
    } else {
      const barWidth = Math.min(40, (chartWidth / chartData.length) * 0.6);
      const gap = (chartWidth - barWidth * chartData.length) / (chartData.length - 1 || 1);

      return (
        <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 shadow-sm mb-6">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 font-outfit">{title}</h4>
          <div className="w-full">
            <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="mx-auto overflow-visible">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingTop + ratio * chartHeight;
                const val = Math.round(maxValue * (1 - ratio));
                return (
                  <g key={i}>
                    <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#e2e8f0" strokeDasharray="3,3" />
                    <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px] font-bold font-mono">{val}</text>
                  </g>
                );
              })}

              {chartData.map((d, index) => {
                const x = paddingLeft + index * (barWidth + gap) + gap/2;
                const barHeight = (d.value / maxValue) * chartHeight;
                const y = paddingTop + chartHeight - barHeight;
                
                return (
                  <g key={index} className="group">
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 2)}
                      rx="4"
                      className="fill-indigo-500 hover:fill-indigo-600 transition-colors cursor-pointer"
                    />
                    <text x={x + barWidth/2} y={y - 6} textAnchor="middle" className="fill-indigo-700 text-[9px] font-bold">{d.value}</text>
                    <text x={x + barWidth/2} y={svgHeight - 12} textAnchor="middle" className="fill-slate-500 text-[9px] font-bold truncate max-w-[50px]">{d.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      );
    }
  };

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

  // explorer detailed page view
  if (selectedExplorer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8 animate-in fade-in duration-300">
        
        {/* Navigation Action */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedExplorer(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 shadow-sm cursor-pointer transition-all active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Overview</span>
          </button>

          <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider font-outfit">
            Explorer View Mode
          </span>
        </div>

        {/* Dynamic SVG Graphs Panel */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white shadow-premium">
          <h3 className="font-bold text-slate-800 text-base mb-4 font-outfit">Graph Visualization dashboard</h3>
          {renderSVGChart()}
        </div>

        {/* Detailed paginated table records */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white shadow-premium">
          <h3 className="font-bold text-slate-800 text-base mb-4 font-outfit">
            {explorerInfo.title} ({explorerInfo.data.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  {explorerInfo.headers.map((h, i) => (
                    <th key={i} className="px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedExplorerData.length === 0 ? (
                  <tr>
                    <td colSpan={explorerInfo.headers.length} className="text-center py-6 text-slate-400">
                      No records matched this metric explorer.
                    </td>
                  </tr>
                ) : (
                  paginatedExplorerData.map((item, idx) => {
                    if (selectedExplorer === 'students') {
                      return (
                        <tr key={item._id || idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-4 py-3 flex items-center space-x-2">
                            <img src={item.profileImage} className="w-6 h-6 rounded-full object-cover" />
                            <span className="font-bold text-slate-800">{item.name}</span>
                          </td>
                          <td className="px-4 py-3 font-mono">{item.registerNumber}</td>
                          <td className="px-4 py-3">{item.department} &bull; {item.year}</td>
                          <td className="px-4 py-3 font-bold text-indigo-600">₹{item.wallet || 0}</td>
                          <td className="px-4 py-3">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</td>
                        </tr>
                      );
                    }
                    if (selectedExplorer === 'resources') {
                      return (
                        <tr key={item._id || idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-800">{item.name}</td>
                          <td className="px-4 py-3">
                            <span className="bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5 font-bold text-[8px] uppercase">{item.category}</span>
                          </td>
                          <td className="px-4 py-3">{item.ownerId?.name || 'N/A'} ({item.ownerId?.department || 'N/A'})</td>
                          <td className="px-4 py-3">{item.isPaid ? `₹${item.price}/day` : 'Free'}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold uppercase text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{item.availability}</span>
                          </td>
                        </tr>
                      );
                    }
                    if (selectedExplorer === 'active_borrows') {
                      return (
                        <tr key={item._id || idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-800">{item.resourceId?.name || 'Resource'}</td>
                          <td className="px-4 py-3">{item.borrowerId?.name || 'N/A'}</td>
                          <td className="px-4 py-3">{item.ownerId?.name || 'N/A'}</td>
                          <td className="px-4 py-3">{new Date(item.pickupTime || item.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-semibold text-rose-500">{new Date(item.dueDate).toLocaleDateString()}</td>
                        </tr>
                      );
                    }
                    if (selectedExplorer === 'completed_swaps') {
                      return (
                        <tr key={item._id || idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-800">{item.resourceId?.name || 'Resource'}</td>
                          <td className="px-4 py-3">{item.borrowerId?.name || 'N/A'}</td>
                          <td className="px-4 py-3">{item.ownerId?.name || 'N/A'}</td>
                          <td className="px-4 py-3">{new Date(item.pickupTime || item.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">{new Date(item.returnTime || item.updatedAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600">₹{item.pickupAmountPaid || 0}</td>
                        </tr>
                      );
                    }
                    if (selectedExplorer === 'pending_requests') {
                      return (
                        <tr key={item._id || idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-800">{item.resourceId?.name || 'Resource'}</td>
                          <td className="px-4 py-3">{item.borrowerId?.name || 'N/A'}</td>
                          <td className="px-4 py-3">{item.ownerId?.name || 'N/A'}</td>
                          <td className="px-4 py-3 font-semibold">{item.borrowDuration} days</td>
                          <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    }
                    if (selectedExplorer === 'overdue_reports') {
                      return (
                        <tr key={item._id || idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-800">{item.resourceId?.name || 'Resource'}</td>
                          <td className="px-4 py-3">{item.borrowerId?.name || 'N/A'}</td>
                          <td className="px-4 py-3 font-bold text-rose-500">₹{item.overdueAmountPaid || 0}</td>
                          <td className="px-4 py-3">{new Date(item.dueDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-bold text-amber-600">Accrued</td>
                        </tr>
                      );
                    }
                    if (selectedExplorer === 'financials') {
                      const rentPaid = item.isPaid ? (item.pickupAmountPaid || 0) : 0;
                      const latePaid = item.isOverduePaid ? (item.overdueAmountPaid || 0) : 0;
                      const totalPaid = rentPaid + latePaid;
                      const commission = Math.round(totalPaid * 0.1 * 100) / 100;
                      return (
                        <tr key={item._id || idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-800 block">{item.resourceId?.name || 'Resource'}</span>
                            <span className="text-[9px] text-slate-400 font-mono">ID: {item._id}</span>
                          </td>
                          <td className="px-4 py-3">{item.borrowerId?.name || 'N/A'}</td>
                          <td className="px-4 py-3 font-semibold text-slate-700">₹{rentPaid}</td>
                          <td className="px-4 py-3 font-semibold text-slate-700">₹{latePaid}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600">₹{commission}</td>
                        </tr>
                      );
                    }
                    return null;
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Explorer Pagination Controls */}
          {totalExplorerPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-slate-400 text-xs">
                Page {explorerPage} of {totalExplorerPages}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setExplorerPage(Math.max(1, explorerPage - 1))}
                  disabled={explorerPage === 1}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setExplorerPage(Math.min(totalExplorerPages, explorerPage + 1))}
                  disabled={explorerPage === totalExplorerPages}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Platform Admin Panel</h1>
          <p className="text-sm text-slate-500 mt-1">Manage student registers, moderates user listings and reviews, and monitor financials.</p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100 rounded-full">
          <Shield className="w-4 h-4" />
          <span>Admin Access Verified</span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Stats Deck */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[
          { id: 'students', label: 'Students size', val: stats.totalStudents, icon: <Users className="w-4 h-4 text-indigo-600" /> },
          { id: 'resources', label: 'Listed resources', val: stats.totalResources, icon: <Package className="w-4 h-4 text-emerald-600" /> },
          { id: 'active_borrows', label: 'Active borrows', val: stats.activeBorrowings, icon: <FileText className="w-4 h-4 text-amber-600" /> },
          { id: 'completed_swaps', label: 'Completed swaps', val: stats.completedTransactions, icon: <CheckCircle className="w-4 h-4 text-teal-600" /> },
          { id: 'pending_requests', label: 'Pending requests', val: stats.pendingRequests, icon: <Clock className="w-4 h-4 text-violet-600" /> },
          { id: 'overdue_reports', label: 'Overdue reports', val: stats.overdueResources, icon: <AlertTriangle className="w-4 h-4 text-rose-600" /> },
          { id: 'financials', label: 'Total Paid Vol.', val: `₹${stats.totalPaymentsVolume || 0}`, icon: <DollarSign className="w-4 h-4 text-sky-600" /> },
          { id: 'financials', label: 'Commissions', val: `₹${stats.adminCommissionEarned || 0}`, icon: <DollarSign className="w-4 h-4 text-emerald-600" /> }
        ].map((stat, idx) => (
          <div 
            key={idx} 
            onClick={() => { setSelectedExplorer(stat.id); setExplorerPage(1); }}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-premium flex flex-col justify-between hover:border-indigo-400 hover:shadow-indigo-100/50 transition-all cursor-pointer group"
          >
            <span className="text-[9px] uppercase font-bold text-slate-400 group-hover:text-indigo-600 transition-colors tracking-wider leading-none">{stat.label}</span>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-xl font-extrabold text-slate-900 font-outfit">{stat.val}</span>
              <div className="p-1 rounded bg-slate-50 flex-shrink-0">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Moderation Tables Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Student Register Panel */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white shadow-premium">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center space-x-1.5 font-outfit">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Manage Registered Students ({usersList.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Register No.</th>
                  <th className="px-4 py-3">Dept & Year</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((st) => (
                  <tr key={st._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 flex items-center space-x-2">
                      <img src={st.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <span className="font-bold text-slate-800 block">{st.name}</span>
                        {st.role === 'admin' && <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[8px] font-bold">Admin</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">{st.registerNumber}</td>
                    <td className="px-4 py-3">{st.department} &bull; {st.year}</td>
                    <td className="px-4 py-3 text-right">
                      {st.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(st._id, st.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Student list Pagination */}
          {totalStudentsPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-[10px] text-slate-400">Page {studentsPage} of {totalStudentsPages}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setStudentsPage(Math.max(1, studentsPage - 1))}
                  disabled={studentsPage === 1}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setStudentsPage(Math.min(totalStudentsPages, studentsPage + 1))}
                  disabled={studentsPage === totalStudentsPages}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resources moderation table */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white shadow-premium">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center space-x-1.5 font-outfit">
            <Package className="w-4 h-4 text-indigo-600" />
            <span>Moderate Listings ({resourcesList.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedListings.map((res) => (
                  <tr key={res._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-800 truncate max-w-[150px]" title={res.name}>
                      {res.name}
                      {res.isPaid && <span className="block text-[9px] text-indigo-600 font-bold">₹{res.price}/day</span>}
                    </td>
                    <td className="px-4 py-3">{res.category}</td>
                    <td className="px-4 py-3">{res.ownerId?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-right flex justify-end space-x-2">
                      <Link
                        to={`/resources/${res._id}`}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleRemoveListing(res._id, res.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Listings Pagination */}
          {totalListingsPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-[10px] text-slate-400">Page {listingsPage} of {totalListingsPages}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setListingsPage(Math.max(1, listingsPage - 1))}
                  disabled={listingsPage === 1}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setListingsPage(Math.min(totalListingsPages, listingsPage + 1))}
                  disabled={listingsPage === totalListingsPages}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Feedback reviews moderation block */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white shadow-premium">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center space-x-1.5 font-outfit">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span>Moderate Student Feedback Reviews ({reviewsList.length})</span>
        </h3>

        {reviewsList.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No reviews recorded on the platform yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Reviewer</th>
                  <th className="px-4 py-3">Reviewed User</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReviews.map((rev) => (
                  <tr key={rev._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 flex items-center space-x-2">
                      <img src={rev.reviewerId?.profileImage} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-bold text-slate-800">{rev.reviewerId?.name || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {rev.reviewedUserId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-500 flex items-center space-x-0.5 mt-1">
                      <span>★</span>
                      <span>{rev.rating}</span>
                    </td>
                    <td className="px-4 py-3 italic max-w-[200px] truncate" title={rev.comment}>
                      "{rev.comment}"
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reviews list Pagination */}
        {totalReviewsPages > 1 && (
          <div className="flex justify-between items-center mt-4 text-left">
            <span className="text-[10px] text-slate-400">Page {reviewsPage} of {totalReviewsPages}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setReviewsPage(Math.max(1, reviewsPage - 1))}
                disabled={reviewsPage === 1}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setReviewsPage(Math.min(totalReviewsPages, reviewsPage + 1))}
                disabled={reviewsPage === totalReviewsPages}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200 text-left">
            <button 
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 font-outfit">{confirmModal.title}</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl active:scale-98 transition-all cursor-pointer font-outfit"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl active:scale-98 transition-all shadow-md shadow-rose-600/10 cursor-pointer font-outfit"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
