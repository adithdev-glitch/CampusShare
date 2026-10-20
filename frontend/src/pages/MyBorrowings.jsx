import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, Clock, Star, Calendar, ShieldCheck, ShieldAlert, Award } from 'lucide-react';
import QRModal from '../components/QRModal';
import RatingModal from '../components/RatingModal';

const MyBorrowings = () => {
  const { user, token, API_URL } = useAuth();

  const [activeTab, setActiveTab] = useState('borrowings'); // 'borrowings' or 'requests'
  const [borrowings, setBorrowings] = useState([]);
  const [lendings, setLendings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal control states
  const [selectedTx, setSelectedTx] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrType, setQrType] = useState('pickup'); // 'pickup' or 'return'
  
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [reviewedPartner, setReviewedPartner] = useState(null);

  const headers = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };

  const fetchBorrowData = async () => {
    setLoading(true);
    try {
      const resBorrows = await axios.get(`${API_URL}/borrows/my-borrowings`, { headers });
      setBorrowings(resBorrows.data.borrowings || []);
      setLendings(resBorrows.data.lendings || []);

      const resReqs = await axios.get(`${API_URL}/borrows/my-requests`, { headers });
      setRequests(resReqs.data.sent || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBorrowData();
    }
  }, [user, token]);

  const handleOpenQR = (tx, type) => {
    setSelectedTx(tx);
    setQrType(type);
    setQrModalOpen(true);
  };

  const handleOpenRating = (tx, partner) => {
    setSelectedTx(tx);
    setReviewedPartner(partner);
    setRatingModalOpen(true);
  };

  // Helper to calculate return countdown text
  const getDeadlineText = (tx) => {
    if (tx.status === 'returned') return 'Returned successfully';
    if (!tx.pickupTime) return 'Not collected yet';

    // expected return calculation: pickup + max duration
    const maxDays = tx.resourceId?.maxBorrowDuration || 7;
    const deadlineDate = new Date(new Date(tx.pickupTime).getTime() + maxDays * 24 * 60 * 60 * 1000);
    const diffTime = deadlineDate.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`, isOverdue: true };
    }
    return { text: `Return in ${diffDays} day${diffDays !== 1 ? 's' : ''}`, isOverdue: false };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">My Borrowings & Lending</h1>
        <p className="text-sm text-slate-500 mt-1">Track resources you borrowed, items you lent out, and generate QR verification codes.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 space-x-6">
        <button
          onClick={() => setActiveTab('borrowings')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
            activeTab === 'borrowings' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Active Borrowings / Lendings ({borrowings.filter(b => b.status !== 'returned').length + lendings.filter(l => l.status !== 'returned').length})</span>
          {activeTab === 'borrowings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
            activeTab === 'requests' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Sent Requests ({requests.length})</span>
          {activeTab === 'requests' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="relative w-10 h-10">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : activeTab === 'borrowings' ? (
        /* Active Borrowings Panel */
        <div className="space-y-10">
          
          {/* Items Borrowed */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-outfit mb-4 flex items-center space-x-1.5">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Resources Borrowed</span>
            </h2>
            {borrowings.length === 0 ? (
              <div className="text-center py-8 bg-white border border-slate-100 rounded-2xl text-xs text-slate-400">
                You haven't borrowed any resources yet. Explore items to request some!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {borrowings.map((tx) => {
                  const deadline = getDeadlineText(tx);
                  return (
                    <div key={tx._id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-premium flex flex-col justify-between">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={tx.resourceId?.images[0]} 
                          alt="" 
                          className="w-16 h-16 rounded-2xl object-cover bg-slate-50 flex-shrink-0" 
                        />
                        <div>
                          <h3 className="font-bold text-sm text-slate-800">{tx.resourceId?.name}</h3>
                          <p className="text-xs text-slate-400">Lender: <span className="font-semibold">{tx.ownerId?.name}</span></p>
                          <span className="text-[10px] text-slate-400 block mt-1">Location: {tx.resourceId?.location}</span>
                        </div>
                      </div>

                      {/* Status alerts */}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          {tx.status === 'approved' && (
                            <span className="text-xs text-indigo-600 font-bold flex items-center space-x-1">
                              <ShieldCheck className="w-4 h-4" />
                              <span>Ready for Pickup</span>
                            </span>
                          )}
                          {tx.status === 'borrowed' && (
                            <span className={`text-xs font-bold flex items-center space-x-1 ${deadline.isOverdue ? 'text-rose-600' : 'text-amber-600'}`}>
                              {deadline.isOverdue ? <ShieldAlert className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                              <span>{deadline.text}</span>
                            </span>
                          )}
                          {tx.status === 'returned' && (
                            <span className="text-xs text-emerald-600 font-bold">Returned successfully</span>
                          )}
                        </div>

                        {/* Interactive Verification Buttons */}
                        <div>
                          {tx.status === 'approved' && (
                            <button
                              onClick={() => handleOpenQR(tx, 'pickup')}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Get Pickup QR
                            </button>
                          )}
                          {tx.status === 'borrowed' && (
                            <button
                              onClick={() => handleOpenQR(tx, 'return')}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-100 cursor-pointer"
                            >
                              Return Resource
                            </button>
                          )}
                          {tx.status === 'returned' && (
                            <button
                              onClick={() => handleOpenRating(tx, tx.ownerId)}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold border border-amber-100 cursor-pointer"
                            >
                              Rate Experience
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Items Lent */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-outfit mb-4 flex items-center space-x-1.5">
              <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
              <span>Resources Lent Out</span>
            </h2>
            {lendings.length === 0 ? (
              <div className="text-center py-8 bg-white border border-slate-100 rounded-2xl text-xs text-slate-400">
                You haven't lent out any resources yet. List items to let others borrow!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lendings.map((tx) => {
                  const deadline = getDeadlineText(tx);
                  return (
                    <div key={tx._id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-premium flex flex-col justify-between">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={tx.resourceId?.images[0]} 
                          alt="" 
                          className="w-16 h-16 rounded-2xl object-cover bg-slate-50 flex-shrink-0" 
                        />
                        <div>
                          <h3 className="font-bold text-sm text-slate-800">{tx.resourceId?.name}</h3>
                          <p className="text-xs text-slate-400">Borrower: <span className="font-semibold">{tx.borrowerId?.name}</span> ({tx.borrowerId?.department})</p>
                          <span className="text-[10px] text-slate-400 block mt-1">Student Year: {tx.borrowerId?.year}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          {tx.status === 'approved' && (
                            <span className="text-xs text-slate-400 font-bold">Awaiting borrower collection</span>
                          )}
                          {tx.status === 'borrowed' && (
                            <span className={`text-xs font-bold ${deadline.isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                              <span>Borrowed &bull; </span>
                              <span>{deadline.text}</span>
                            </span>
                          )}
                          {tx.status === 'returned' && (
                            <span className="text-xs text-emerald-600 font-bold">Returned safely</span>
                          )}
                        </div>

                        <div>
                          {tx.status === 'approved' && (
                            <button
                              onClick={() => handleOpenQR(tx, 'pickup')}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10px] font-bold border border-indigo-100 cursor-pointer"
                            >
                              Scan Pickup QR
                            </button>
                          )}
                          {tx.status === 'borrowed' && (
                            <button
                              onClick={() => handleOpenQR(tx, 'return')}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Scan Return QR
                            </button>
                          )}
                          {tx.status === 'returned' && (
                            <button
                              onClick={() => handleOpenRating(tx, tx.borrowerId)}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold border border-amber-100 cursor-pointer"
                            >
                              Rate Borrower
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Sent Requests Panel */
        requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-premium flex flex-col items-center">
            <Clock className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 font-outfit">No sent requests</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">You haven't requested any resources yet. View explore resources and make your first request!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div 
                key={req._id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-premium flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  <img 
                    src={req.resourceId?.images[0]} 
                    alt="" 
                    className="w-14 h-14 rounded-2xl object-cover bg-slate-50" 
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{req.resourceId?.name}</h3>
                    <p className="text-xs text-slate-400">Owner: {req.ownerId?.name}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">Requested Date: {new Date(req.requestedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    req.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                    req.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* QR simulator popup */}
      <QRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        transaction={selectedTx}
        type={qrType}
        onSuccess={fetchBorrowData}
      />

      {/* Star rating popup */}
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        transaction={selectedTx}
        reviewedUser={reviewedPartner}
        onSuccess={fetchBorrowData}
      />
    </div>
  );
};

export default MyBorrowings;
