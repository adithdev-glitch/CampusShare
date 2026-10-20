import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Star, Sparkles, Shield, Heart, Send, CheckSquare, Plus, Info, CheckCircle } from 'lucide-react';

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, toggleWishlist, API_URL } = useAuth();

  const [resource, setResource] = useState(null);
  const [lendingsCount, setLendingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Request Form State
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [message, setMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const getEstimatedCost = () => {
    if (!expectedReturnDate || !resource || !resource.isPaid) return 0;
    const diffTime = new Date(expectedReturnDate) - new Date();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return diffDays * resource.price;
  };

  const fetchResourceDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/resources/${id}`);
      if (res.data.success) {
        setResource(res.data.resource);
        setLendingsCount(res.data.lendingsCount);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load resource details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResourceDetails();
  }, [id]);

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const result = await toggleWishlist(resource._id);
    if (result.success) {
      fetchResourceDetails();
    }
  };

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!expectedReturnDate || !purpose) {
      alert('Please fill in return date and purpose.');
      return;
    }

    if (!agreedToTerms) {
      alert('You must accept the damage responsibility terms.');
      return;
    }

    setRequestLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${API_URL}/borrows/request`,
        {
          resourceId: resource._id,
          expectedReturnDate,
          purpose,
          message,
          agreedToTerms
        },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
        }
      );

      if (res.data.success) {
        setRequestSuccess(true);
        setTimeout(() => {
          setRequestSuccess(false);
          setShowRequestForm(false);
          setExpectedReturnDate('');
          setPurpose('');
          setMessage('');
          setAgreedToTerms(false);
          // Refresh details to show update status (if availability changes)
          fetchResourceDetails();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit borrow request.');
    } finally {
      setRequestLoading(false);
    }
  };

  const isItemWishlisted = () => {
    return user?.wishlist?.includes(resource?._id);
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

  if (error && !resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 inline-block mb-4 text-sm">
          {error}
        </div>
        <div>
          <Link to="/explore" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && resource.ownerId?._id === user.id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back button */}
      <div className="mb-6 text-left">
        <Link to="/explore" className="text-slate-400 hover:text-slate-700 text-xs font-semibold flex items-center space-x-1">
          <span>&larr; Back to Explore</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Side: Images & Included Items */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 shadow-premium bg-white overflow-hidden p-2">
            <img
              src={resource.images[0]}
              alt={resource.name}
              className="w-full h-80 object-cover rounded-2xl bg-slate-50"
            />
          </div>

          {/* Accessories included */}
          {resource.accessories && resource.accessories.length > 0 && (
            <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white text-left">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center space-x-1.5 font-outfit">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                <span>Accessories Included</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {resource.accessories.map((acc, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{acc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suitable for */}
          {resource.suitableFor && resource.suitableFor.length > 0 && (
            <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white text-left">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center space-x-1.5 font-outfit">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Suitable For</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {resource.suitableFor.map((item, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Description, Owner Details, Borrow Actions */}
        <div className="space-y-6 text-left">
          
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{resource.category}</span>
              
              {/* Availability tag */}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                resource.availability ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
              }`}>
                {resource.availability ? 'Available Now' : 'Currently Lent'}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 font-outfit leading-tight pt-1">
              {resource.name}
            </h1>

            <div className="flex items-center space-x-2 mt-1">
              {resource.isPaid ? (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-lg">
                  Rental Cost: ₹{resource.price} / day
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-lg">
                  Free to Borrow
                </span>
              )}
            </div>
            
            <p className="text-slate-500 text-sm leading-relaxed">{resource.description}</p>
          </div>

          {/* Meta metrics grid */}
          <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-5 text-sm text-slate-600">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><MapPin className="w-4 h-4" /></div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Pickup Location</span>
                <span className="font-semibold text-slate-800">{resource.location}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Calendar className="w-4 h-4" /></div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Max Borrow Limit</span>
                <span className="font-semibold text-slate-800">{resource.maxBorrowDuration} Days</span>
              </div>
            </div>
          </div>

          {/* Owner details block */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src={resource.ownerId?.profileImage} 
                alt="" 
                className="w-12 h-12 rounded-full border border-indigo-100 object-cover" 
              />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Resource Lender</span>
                <Link to={`/profile/${resource.ownerId?._id}`} className="font-bold text-sm text-slate-800 hover:text-indigo-600 transition-colors">
                  {resource.ownerId?.name}
                </Link>
                <span className="text-xs text-slate-400 block">{resource.ownerId?.department} department</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end space-x-0.5 text-sm font-bold text-yellow-500">
                <Star className="w-4 h-4 fill-yellow-500" />
                <span>{resource.ownerId?.rating}</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">{lendingsCount} successful lendings</span>
            </div>
          </div>

          {/* Actions & Request box */}
          {isOwner ? (
            <div className="p-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/30 text-indigo-700 text-xs font-semibold flex items-center space-x-2 justify-center">
              <Shield className="w-4 h-4" />
              <span>You are the owner of this resource. You can manage requests from the My Listings tab.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {!showRequestForm ? (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                      } else {
                        setShowRequestForm(true);
                      }
                    }}
                    disabled={!resource.availability}
                    className="flex-grow py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
                  >
                    <span>Request to Borrow</span>
                  </button>

                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3.5 border rounded-xl flex items-center justify-center hover:scale-105 transition-all cursor-pointer ${
                      isItemWishlisted() 
                        ? 'bg-rose-50 border-rose-200 text-rose-500' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                    }`}
                    title="Add to Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isItemWishlisted() ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>
              ) : (
                /* Borrow Request Inline Form card */
                <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white shadow-premium">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Request Details</h3>
                  
                  {requestSuccess ? (
                    <div className="text-center py-6 text-emerald-600 font-semibold text-xs flex flex-col items-center">
                      <CheckCircle className="w-8 h-8 mb-2 animate-bounce" />
                      <span>Your borrow request has been sent successfully!</span>
                    </div>
                  ) : (
                    <form onSubmit={handleBorrowSubmit} className="space-y-4">
                      {/* Expected return date */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Expected Return Date
                        </label>
                        <input
                          type="date"
                          required
                          value={expectedReturnDate}
                          onChange={(e) => setExpectedReturnDate(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                        />
                      </div>

                      {/* Purpose */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Purpose of borrowing
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. IoT robotics lab session tests next Monday"
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Message to Owner (Optional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Add any extra notes..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 bg-slate-50/50 resize-none"
                        />
                      </div>

                      {/* Cost estimation summary (if paid) */}
                      {resource.isPaid && expectedReturnDate && (
                        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl mb-3">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Estimated Total Rent</span>
                          <span className="text-sm font-bold text-slate-800">
                            ₹{getEstimatedCost()} <span className="text-[10px] text-slate-400 font-semibold">(for {Math.max(1, Math.ceil((new Date(expectedReturnDate) - new Date()) / (1000 * 60 * 60 * 24)))} days)</span>
                          </span>
                        </div>
                      )}

                      {/* Damage Agreement terms Checkbox */}
                      <div className="flex items-start space-x-2.5 p-3.5 bg-rose-50/20 border border-rose-100/50 rounded-xl mb-4">
                        <input
                          type="checkbox"
                          id="terms"
                          required
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-slate-600 text-[10px] leading-relaxed select-none cursor-pointer">
                          I agree that I am <span className="font-bold text-slate-800">fully responsible</span> for any loss, damage, or wear incurred to this item during the borrowing period. I agree to cover all costs for repair or equivalent replacement.
                        </label>
                      </div>

                      <div className="flex space-x-3 pt-2">
                        <button
                          type="submit"
                          disabled={requestLoading}
                          className="flex-grow py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Request</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRequestForm(false)}
                          className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceDetails;
