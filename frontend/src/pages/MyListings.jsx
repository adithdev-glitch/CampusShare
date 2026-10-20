import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, ListFilter, Trash2, Shield, Eye, Calendar, Sparkles, Check, X, ShieldAlert, Pencil } from 'lucide-react';

const categories = [
  'Electronics', 'Project Kits', 'Lab Equipment', 'Books', 
  'Calculators', 'Computer Accessories', 'Hostel Essentials', 'Sports Equipment'
];
const conditions = ['Excellent', 'Good', 'Fair', 'Needs Repair'];

const MyListings = () => {
  const { user, token, API_URL } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'requests'
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errMessage, setErrMessage] = useState('');

  const [editingResource, setEditingResource] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'Electronics',
    description: '',
    imageUrl: '',
    condition: 'Excellent',
    quantity: 1,
    maxBorrowDuration: 7,
    location: '',
    accessories: '',
    suitableFor: '',
    tags: '',
    isPaid: false,
    price: 0,
  });
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const headers = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };

  const fetchMyData = async () => {
    setLoading(true);
    try {
      // Fetch listings
      const resAll = await axios.get(`${API_URL}/resources`);
      const myListed = resAll.data.resources.filter(r => r.ownerId?._id === user?.id) || [];
      setListings(myListed);

      // Fetch requests
      const resRequests = await axios.get(`${API_URL}/borrows/my-requests`, { headers });
      setRequests(resRequests.data.received || []);
    } catch (err) {
      console.error(err);
      setErrMessage('Failed to load listings data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyData();
    }
  }, [user, token]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'requests') {
      setActiveTab('requests');
    } else if (tab === 'listings') {
      setActiveTab('listings');
    }
  }, [location]);

  const handleToggleAvailability = async (id, currentVal) => {
    try {
      const res = await axios.put(
        `${API_URL}/resources/${id}`,
        { availability: !currentVal },
        { headers }
      );
      if (res.data.success) {
        setListings(listings.map(l => l._id === id ? { ...l, availability: !currentVal } : l));
        setMessage('Availability updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setErrMessage('Failed to update availability.');
      setTimeout(() => setErrMessage(''), 3000);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await axios.delete(`${API_URL}/resources/${id}`, { headers });
      if (res.data.success) {
        setListings(listings.filter(l => l._id !== id));
        setMessage('Listing deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setErrMessage('Failed to delete listing.');
      setTimeout(() => setErrMessage(''), 3000);
    }
  };

  const handleRespond = async (id, status) => {
    setActionLoading(true);
    setErrMessage('');
    setMessage('');
    try {
      const res = await axios.post(
        `${API_URL}/borrows/request/${id}/respond`,
        { status },
        { headers }
      );
      if (res.data.success) {
        setRequests(requests.map(r => r._id === id ? { ...r, status } : r));
        setMessage(`Request successfully ${status}!`);
        fetchMyData(); // Refresh list to update availability statuses
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrMessage(err.response?.data?.message || 'Action failed.');
      setTimeout(() => setErrMessage(''), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingResource(item);
    setEditFormData({
      name: item.name || '',
      category: item.category || 'Electronics',
      description: item.description || '',
      imageUrl: item.images && item.images.length > 0 ? item.images[0] : '',
      condition: item.condition || 'Excellent',
      quantity: item.quantity || 1,
      maxBorrowDuration: item.maxBorrowDuration || 7,
      location: item.location || '',
      accessories: item.accessories ? item.accessories.join(', ') : '',
      suitableFor: item.suitableFor ? item.suitableFor.join(', ') : '',
      tags: item.tags ? item.tags.join(', ') : '',
      isPaid: item.isPaid || false,
      price: item.price || 0,
    });
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    setEditError('');

    const accessoriesArray = editFormData.accessories
      ? editFormData.accessories.split(',').map(i => i.trim()).filter(Boolean)
      : [];
    const suitableForArray = editFormData.suitableFor
      ? editFormData.suitableFor.split(',').map(i => i.trim()).filter(Boolean)
      : [];
    const tagsArray = editFormData.tags
      ? editFormData.tags.split(',').map(i => i.trim()).filter(Boolean)
      : [];

    try {
      const res = await axios.put(
        `${API_URL}/resources/${editingResource._id}`,
        {
          name: editFormData.name,
          category: editFormData.category,
          description: editFormData.description,
          images: editFormData.imageUrl ? [editFormData.imageUrl] : editingResource.images,
          condition: editFormData.condition,
          quantity: parseInt(editFormData.quantity),
          maxBorrowDuration: parseInt(editFormData.maxBorrowDuration),
          location: editFormData.location,
          accessories: accessoriesArray,
          suitableFor: suitableForArray,
          tags: tagsArray,
          isPaid: editFormData.isPaid,
          price: editFormData.isPaid ? parseFloat(editFormData.price) : 0,
        },
        { headers }
      );

      if (res.data.success) {
        setMessage('Resource updated successfully!');
        setListings(listings.map(l => l._id === editingResource._id ? res.data.resource : l));
        setEditingResource(null);
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setEditError(err.response?.data?.message || 'Failed to update resource.');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">My Listings & Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Manage items you share and respond to borrowing requests from classmates.</p>
        </div>
        <Link
          to="/list-resource"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all hover:scale-102 cursor-pointer"
        >
          Share New Resource
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 space-x-6">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
            activeTab === 'listings' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>My Listed Resources ({listings.length})</span>
          {activeTab === 'listings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
            activeTab === 'requests' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Incoming Requests ({requests.filter(r => r.status === 'pending').length})</span>
          {activeTab === 'requests' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
        </button>
      </div>

      {/* Alerts */}
      {message && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-center space-x-1.5 animate-pulse-slow">
          <Check className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      {errMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center space-x-1.5">
          <ShieldAlert className="w-4 h-4" />
          <span>{errMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="relative w-10 h-10">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : activeTab === 'listings' ? (
        /* Listings Panel */
        listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-premium flex flex-col items-center">
            <Package className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 font-outfit">No resources listed</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">You haven't listed any items for sharing yet. Share textbook notes or mini controllers to support others!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-premium hover:shadow-indigo-500/5 hover:border-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col group relative"
              >
                <img 
                  src={item.images[0]} 
                  alt={item.name} 
                  className="w-full h-40 object-cover bg-slate-100" 
                />

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{item.category}</span>
                    <h4 className="font-bold text-sm text-slate-800 leading-tight pt-1 truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-400">Pickup Location: {item.location}</p>
                  </div>

                  {/* Toggle availability & buttons */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    
                    {/* Toggle Slider */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Available</span>
                      <button
                        onClick={() => handleToggleAvailability(item._id, item.availability)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          item.availability ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          item.availability ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/resources/${item._id}`}
                        className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50/50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50/50 transition-colors cursor-pointer"
                        title="Edit Listing"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteListing(item._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50/50 transition-colors cursor-pointer"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Requests Received Panel */
        requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-premium flex flex-col items-center">
            <ListFilter className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 font-outfit">No incoming requests</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">No classmates have requested to borrow your items yet. We will notify you here when they do.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div 
                key={req._id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-premium flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                {/* Details */}
                <div className="flex items-start space-x-4">
                  <img
                    src={req.resourceId?.images[0]}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-50"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Request for <Link to={`/resources/${req.resourceId?._id}`} className="text-indigo-600 hover:underline">{req.resourceId?.name}</Link>
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                      <span>Requester: <Link to={`/profile/${req.borrowerId?._id}`} className="font-bold text-slate-600 hover:text-indigo-600">{req.borrowerId?.name}</Link></span>
                      <span>&bull;</span>
                      <span>Rating: {req.borrowerId?.rating} ⭐</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-1 uppercase font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Expected Return: {new Date(req.expectedReturnDate).toLocaleDateString()}</span>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 max-w-xl">
                      <p className="text-xs text-slate-600 font-semibold"><span className="text-slate-400 uppercase text-[9px] block">Purpose</span>{req.purpose}</p>
                      {req.message && <p className="text-xs text-slate-500 mt-1"><span className="text-slate-400 uppercase text-[9px] block">Message</span>"{req.message}"</p>}
                    </div>
                  </div>
                </div>

                {/* Actions respond */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0 w-full md:w-auto">
                  {req.status === 'pending' ? (
                    <div className="flex space-x-2 w-full md:w-auto">
                      <button
                        onClick={() => handleRespond(req._id, 'approved')}
                        disabled={actionLoading}
                        className="flex-grow md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/10 active:scale-95 transition-all flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRespond(req._id, 'rejected')}
                        disabled={actionLoading}
                        className="flex-grow md:flex-none px-4 py-2 bg-rose-50 hover:bg-rose-100/80 text-rose-600 rounded-xl text-xs font-semibold border border-rose-100 active:scale-95 transition-all flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      req.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {req.status}
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )
      )}

      {/* Edit Resource Modal */}
      {editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 md:p-8 relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setEditingResource(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 font-outfit">Edit Resource</h2>
              <p className="text-xs text-slate-500 mt-1">Update the details of your shared resource.</p>
            </div>

            {editError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Resource Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Resource Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs appearance-none"
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Item Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Condition */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={editFormData.condition}
                    onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs appearance-none"
                  >
                    {conditions.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min={1}
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                  />
                </div>

                {/* Max borrow limit */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Max Duration (Days)
                  </label>
                  <input
                    type="number"
                    name="maxBorrowDuration"
                    min={1}
                    value={editFormData.maxBorrowDuration}
                    onChange={(e) => setEditFormData({ ...editFormData, maxBorrowDuration: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pickup location */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Pickup Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={editFormData.imageUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                {/* Rent Type Option */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Pricing Option
                  </label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="isPaid"
                        checked={!editFormData.isPaid}
                        onChange={() => setEditFormData({ ...editFormData, isPaid: false, price: 0 })}
                        className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="font-semibold text-slate-700">Free</span>
                    </label>
                    <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="isPaid"
                        checked={editFormData.isPaid}
                        onChange={() => setEditFormData({ ...editFormData, isPaid: true })}
                        className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="font-semibold text-slate-700">Paid</span>
                    </label>
                  </div>
                </div>

                {/* Price per day */}
                {editFormData.isPaid && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 animate-in fade-in duration-200">
                      Daily Rent Price (INR) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      min={1}
                      placeholder="e.g. 50"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-white text-xs animate-in fade-in slide-in-from-top-1 duration-200"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Accessories */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Accessories
                  </label>
                  <span className="text-[9px] text-slate-400 block mb-1">Comma separated</span>
                  <input
                    type="text"
                    name="accessories"
                    value={editFormData.accessories}
                    onChange={(e) => setEditFormData({ ...editFormData, accessories: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                  />
                </div>

                {/* Suitable for */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Suitable For
                  </label>
                  <span className="text-[9px] text-slate-400 block mb-1">Comma separated</span>
                  <input
                    type="text"
                    name="suitableFor"
                    value={editFormData.suitableFor}
                    onChange={(e) => setEditFormData({ ...editFormData, suitableFor: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Search Tags
                  </label>
                  <span className="text-[9px] text-slate-400 block mb-1">Comma separated</span>
                  <input
                    type="text"
                    name="tags"
                    value={editFormData.tags}
                    onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl active:scale-98 transition-all cursor-pointer text-center font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-grow flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/10 cursor-pointer font-outfit"
                >
                  {editSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings;
