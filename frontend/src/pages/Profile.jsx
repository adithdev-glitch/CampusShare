import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, GraduationCap, Star, BookOpen, Clock, Heart, Award, ShieldCheck, Settings, KeyRound, X, ShieldAlert, Check, CreditCard, TrendingUp, TrendingDown, Landmark, Trash2 } from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, token, refreshUser, API_URL } = useAuth();
  const location = useLocation();
  
  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    department: '',
    year: '',
    registerNumber: '',
    profileImage: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // If no params ID, default to logged in user ID
  const targetId = userId || currentUser?.id;
  const headers = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };

  // Wallet and withdrawal state
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('resources');
  const [wishlist, setWishlist] = useState([]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user data
      const resUser = await axios.get(`${API_URL}/auth/user/${targetId}`, { headers });
      const userDetails = resUser.data.user;
      setProfileUser(userDetails);

      // 2. Fetch reviews
      const resReviews = await axios.get(`${API_URL}/reviews/user/${targetId}`);
      setReviews(resReviews.data.reviews || []);

      // 3. Fetch listings owned by this user
      const resListings = await axios.get(`${API_URL}/resources`);
      const userListings = resListings.data.resources.filter(r => r.ownerId?._id === targetId);
      setListings(userListings);

      // 4. Compile unified payment transactions list if viewing own profile
      if (targetId === currentUser?.id) {
        const txList = [];

        // Add withdrawals to the transaction log
        if (userDetails.withdrawals && userDetails.withdrawals.length > 0) {
          userDetails.withdrawals.forEach(w => {
            txList.push({
              id: w._id || `withdrawal-${w.date}`,
              type: 'withdraw',
              description: 'Funds Withdrawal to Bank Account',
              amount: w.amount,
              date: w.date,
            });
          });
        }

        try {
          const resTx = await axios.get(`${API_URL}/borrows/my-borrowings`, { headers });
          const borrowingsList = resTx.data.borrowings || [];
          const lendingsList = resTx.data.lendings || [];

          borrowingsList.forEach(tx => {
            if (tx.isPaid) {
              txList.push({
                id: `${tx._id}-borrow-pickup`,
                type: 'debit',
                description: `Rental fee for "${tx.resourceId?.name || 'Resource'}"`,
                amount: tx.pickupAmountPaid || 0,
                date: tx.pickupTime || tx.createdAt,
              });
            }
            if (tx.isOverduePaid) {
              txList.push({
                id: `${tx._id}-borrow-return`,
                type: 'debit',
                description: `Late fee for "${tx.resourceId?.name || 'Resource'}"`,
                amount: tx.overdueAmountPaid || 0,
                date: tx.returnTime || tx.updatedAt,
              });
            }
          });

          lendingsList.forEach(tx => {
            if (tx.isPaid) {
              txList.push({
                id: `${tx._id}-lend-pickup`,
                type: 'credit',
                description: `Earnings from "${tx.resourceId?.name || 'Resource'}"`,
                amount: tx.pickupAmountPaid || 0,
                date: tx.pickupTime || tx.createdAt,
              });
            }
            if (tx.isOverduePaid) {
              txList.push({
                id: `${tx._id}-lend-return`,
                type: 'credit',
                description: `Late fee earnings from "${tx.resourceId?.name || 'Resource'}"`,
                amount: tx.overdueAmountPaid || 0,
                date: tx.returnTime || tx.updatedAt,
              });
            }
          });

        } catch (txErr) {
          console.error('Error fetching transaction logs:', txErr);
        }

        // Sort chronologically (newest first)
        txList.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWalletTransactions(txList);

        // Fetch wishlist items
        try {
          const resWish = await axios.get(`${API_URL}/resources/wishlist/all`, { headers });
          if (resWish.data.success) {
            setWishlist(resWish.data.wishlist || []);
          }
        } catch (wishErr) {
          console.error('Error fetching wishlist:', wishErr);
        }
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (parseFloat(withdrawAmount) > (profileUser.wallet || 0)) {
      alert('Insufficient wallet balance.');
      return;
    }

    setWithdrawLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/auth/wallet/withdraw`,
        { amount: parseFloat(withdrawAmount) },
        { headers }
      );
      if (res.data.success) {
        alert(res.data.message || 'Withdrawal completed successfully!');
        setWithdrawModalOpen(false);
        setWithdrawAmount('');
        fetchProfileData();
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (e, resourceId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await axios.post(`${API_URL}/resources/${resourceId}/wishlist`, {}, { headers });
      if (res.data.success) {
        setWishlist(wishlist.filter(item => item._id !== resourceId));
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      console.error('Error removing item from wishlist:', err);
    }
  };

  const handleOpenEditModal = () => {
    setEditForm({
      name: profileUser.name || '',
      department: profileUser.department || '',
      year: profileUser.year || '',
      registerNumber: profileUser.registerNumber || '',
      profileImage: profileUser.profileImage || '',
    });
    setModalError('');
    setModalSuccess('');
    setIsEditModalOpen(true);
  };

  const handleOpenPasswordModal = () => {
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setModalError('');
    setModalSuccess('');
    setIsPasswordModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError('');
    setModalSuccess('');

    try {
      const res = await axios.put(`${API_URL}/auth/profile`, editForm, { headers });
      if (res.data.success) {
        setProfileUser(res.data.user);
        setModalSuccess('Profile updated successfully!');
        refreshUser();
        setTimeout(() => setIsEditModalOpen(false), 1500);
      }
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError('');
    setModalSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setModalError('New passwords do not match');
      setModalSubmitting(false);
      return;
    }

    try {
      const res = await axios.put(`${API_URL}/auth/change-password`, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      }, { headers });

      if (res.data.success) {
        setModalSuccess('Password changed successfully!');
        setTimeout(() => setIsPasswordModalOpen(false), 1500);
      }
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setModalSubmitting(false);
    }
  };

  useEffect(() => {
    if (targetId) {
      fetchProfileData();
    }
  }, [targetId]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

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

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-sm text-slate-500">Student profile not found.</p>
      </div>
    );
  }

  // Calculate Badges
  const isTrustedLender = profileUser.rating >= 4.5 && listings.length >= 2;
  const isActiveSharer = listings.length >= 4;
  const isResponsibleBorrower = profileUser.rating >= 4.2;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Top Banner layout */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-200 bg-white shadow-premium flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center space-x-4">
          <img
            src={profileUser.profileImage}
            alt=""
            className="w-20 h-20 rounded-full border border-indigo-100 object-cover"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900 font-outfit">{profileUser.name}</h1>
              {isTrustedLender && <ShieldCheck className="w-5 h-5 text-indigo-600" title="Trusted Lender" />}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{profileUser.email}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {profileUser.department} Department &bull; {profileUser.year}
            </p>
            {targetId === currentUser?.id && (
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={handleOpenEditModal}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer font-outfit"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={handleOpenPasswordModal}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer font-outfit"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Change Password</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-left md:text-right flex-shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Average Rating</span>
          <div className="flex items-center md:justify-end space-x-0.5 text-2xl font-black text-yellow-500 mt-1">
            <Star className="w-6 h-6 fill-yellow-500" />
            <span>{profileUser.rating}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{reviews.length} reviews received</span>
        </div>
      </div>

      {/* Badges and listings details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Badges & Stats */}
        <div className="space-y-6">

          {/* Wallet Dashboard card (Own profile only) */}
          {targetId === currentUser?.id && (
            <div className="relative overflow-hidden rounded-3xl border border-indigo-200/40 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white shadow-xl shadow-indigo-600/10 text-left">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
              
              <div className="relative space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-200">CampusShare Wallet</span>
                  <div className="px-2 py-0.5 rounded bg-white/20 text-[8px] font-bold uppercase tracking-widest font-mono">
                    Active
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-indigo-200 font-bold block uppercase tracking-wider">Total Earnings Balance</span>
                  <span className="text-3xl font-black font-outfit tracking-tight">₹{profileUser?.wallet || 0}</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setWithdrawModalOpen(true)}
                    disabled={!profileUser?.wallet || profileUser.wallet <= 0}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-indigo-700 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 font-outfit flex items-center justify-center space-x-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Withdraw Funds</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Badges Section */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white shadow-premium text-left animate-in fade-in duration-300">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center space-x-1.5 font-outfit">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Student Badges</span>
            </h3>
            
            <div className="space-y-3">
              {isTrustedLender && (
                <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                  <span className="text-xl">🏆</span>
                  <div>
                    <span className="text-xs font-bold text-indigo-700 block">Trusted Lender</span>
                    <span className="text-[10px] text-slate-500">Listed 2+ items with high ratings</span>
                  </div>
                </div>
              )}
              {isActiveSharer && (
                <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                  <span className="text-xl">🌟</span>
                  <div>
                    <span className="text-xs font-bold text-emerald-700 block">Active Sharer</span>
                    <span className="text-[10px] text-slate-500">Shared 4+ resources on campus</span>
                  </div>
                </div>
              )}
              {isResponsibleBorrower && (
                <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-amber-50/50 border border-amber-100/50">
                  <span className="text-xl">⚡</span>
                  <div>
                    <span className="text-xs font-bold text-amber-700 block">Responsible Borrower</span>
                    <span className="text-[10px] text-slate-500">High ratings on returned objects</span>
                  </div>
                </div>
              )}
              {!isTrustedLender && !isActiveSharer && !isResponsibleBorrower && (
                <p className="text-xs text-slate-400 text-center py-4">No badges earned yet.</p>
              )}
            </div>
          </div>

          {/* Stats count summary */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white shadow-premium">
            <h3 className="font-bold text-slate-800 text-sm mb-4 font-outfit">Platform History</h3>
            <div className={`grid ${targetId === currentUser?.id ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <span className="text-2xl font-extrabold text-slate-900 block font-outfit">{listings.length}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Items Listed</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <span className="text-2xl font-extrabold text-slate-900 block font-outfit">{reviews.length}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Total Reviews</span>
              </div>
              {targetId === currentUser?.id && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                  <span className="text-2xl font-extrabold text-indigo-700 block font-outfit">₹{profileUser.wallet || 0}</span>
                  <span className="text-[9px] font-bold text-indigo-500 uppercase">Wallet Earnings</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Listed Items & Reviews list tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 space-x-6">
            <button
              onClick={() => setActiveTab('resources')}
              className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
                activeTab === 'resources' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Shared Resources ({listings.length})</span>
              {activeTab === 'resources' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
                activeTab === 'reviews' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Feedback Reviews ({reviews.length})</span>
              {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
            </button>

            {targetId === currentUser?.id && (
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
                  activeTab === 'wishlist' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>My Wishlist ({wishlist.length})</span>
                {activeTab === 'wishlist' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
              </button>
            )}

            {targetId === currentUser?.id && (
              <button
                onClick={() => setActiveTab('wallet')}
                className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
                  activeTab === 'wallet' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Transaction details ({walletTransactions.length})</span>
                {activeTab === 'wallet' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
              </button>
            )}
          </div>

          {/* Resources listed Tab */}
          {activeTab === 'resources' && (
            <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white shadow-premium text-left animate-in fade-in duration-300">
              <h3 className="font-bold text-slate-800 text-sm mb-4 font-outfit flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Shared Resources</span>
              </h3>

              {listings.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No active listings shared by this student.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listings.map((item) => (
                    <Link
                      key={item._id}
                      to={`/resources/${item._id}`}
                      className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100/50 hover:bg-slate-50/50 transition-all"
                    >
                      <img 
                        src={item.images[0]} 
                        alt="" 
                        className="w-12 h-12 rounded-xl object-cover bg-slate-50 flex-shrink-0" 
                      />
                      <div className="truncate text-left">
                        <h4 className="font-bold text-xs text-slate-800 truncate">{item.name}</h4>
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{item.category}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews tab */}
          {activeTab === 'reviews' && (
            <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white shadow-premium text-left animate-in fade-in duration-300">
              <h3 className="font-bold text-slate-800 text-sm mb-4 font-outfit flex items-center space-x-1.5">
                <Star className="w-4 h-4 text-indigo-600" />
                <span>Feedback Reviews</span>
              </h3>

              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No reviews received yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 text-left">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <img 
                            src={rev.reviewerId?.profileImage} 
                            alt="" 
                            className="w-6 h-6 rounded-full object-cover" 
                          />
                          <span className="font-bold text-xs text-slate-800">{rev.reviewerId?.name}</span>
                          <span className="text-[9px] text-slate-400">{rev.reviewerId?.department}</span>
                        </div>
                        
                        <div className="flex items-center space-x-0.5 text-xs font-bold text-yellow-500">
                          <Star className="w-3.5 h-3.5 fill-yellow-500" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-600 mt-2 italic font-medium">"{rev.comment}"</p>
                      <span className="text-[9px] text-slate-400 mt-2 block text-right">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist tab */}
          {activeTab === 'wishlist' && targetId === currentUser?.id && (
            <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white shadow-premium text-left animate-in fade-in duration-300">
              <h3 className="font-bold text-slate-800 text-sm mb-4 font-outfit flex items-center space-x-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>My Wishlist</span>
              </h3>

              {wishlist.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Your wishlist is currently empty.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <Link
                      key={item._id}
                      to={`/resources/${item._id}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-100/50 hover:bg-slate-50/50 transition-all group"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <img 
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=200'} 
                          alt="" 
                          className="w-12 h-12 rounded-xl object-cover bg-slate-50 flex-shrink-0" 
                        />
                        <div className="truncate text-left">
                          <h4 className="font-bold text-xs text-slate-800 truncate">{item.name}</h4>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{item.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleRemoveFromWishlist(e, item._id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer flex-shrink-0"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ledger Tab */}
          {activeTab === 'wallet' && targetId === currentUser?.id && (
            <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white shadow-premium text-left animate-in fade-in duration-300">
              <h3 className="font-bold text-slate-800 text-sm mb-4 font-outfit flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Wallet Transaction details</span>
              </h3>

              {walletTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No payment transactions recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {walletTransactions.map((tx, idx) => (
                    <div key={tx.id || idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          tx.type === 'credit' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100/30' :
                          tx.type === 'debit' ? 'text-rose-600 bg-rose-50 border border-rose-100/30' :
                          'text-purple-600 bg-purple-50 border border-purple-100/30'
                        }`}>
                          {tx.type === 'credit' && <TrendingUp className="w-4 h-4" />}
                          {tx.type === 'debit' && <TrendingDown className="w-4 h-4" />}
                          {tx.type === 'withdraw' && <Landmark className="w-4 h-4" />}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">{tx.description}</p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div className={`font-black text-sm text-right ${
                        tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-850'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 md:p-8 relative animate-in fade-in zoom-in duration-200 text-left">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 font-outfit">Edit Profile Details</h2>
              <p className="text-xs text-slate-500 mt-1">Update your account information.</p>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-center space-x-1.5">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Register Number *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.registerNumber}
                  onChange={(e) => setEditForm({ ...editForm, registerNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Study Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Profile Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={editForm.profileImage}
                  onChange={(e) => setEditForm({ ...editForm, profileImage: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl active:scale-98 transition-all cursor-pointer font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/10 cursor-pointer font-outfit"
                >
                  {modalSubmitting ? (
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

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 md:p-8 relative animate-in fade-in zoom-in duration-200 text-left">
            <button 
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 font-outfit">Change Password</h2>
              <p className="text-xs text-slate-500 mt-1">Ensure your account is protected with a secure password.</p>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-center space-x-1.5">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-xs"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl active:scale-98 transition-all cursor-pointer text-center font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/10 cursor-pointer font-outfit"
                >
                  {modalSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Change Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200 text-left">
            <button 
              onClick={() => setWithdrawModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 font-outfit">Withdraw Funds</h2>
              <p className="text-xs text-slate-500 mt-1">Deduct earnings from your campus wallet directly to your bank account.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl mb-5 flex items-center justify-between border border-slate-200/50">
              <span className="text-xs font-semibold text-slate-500">Available Balance</span>
              <span className="text-lg font-black text-slate-800">₹{profileUser?.wallet || 0}</span>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Amount to Withdraw (INR) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={profileUser?.wallet || 0}
                  placeholder="e.g. 100"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={withdrawLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > (profileUser?.wallet || 0)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl active:scale-98 transition-all flex items-center justify-center space-x-1 shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50 font-outfit"
              >
                {withdrawLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Submit Withdrawal</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
