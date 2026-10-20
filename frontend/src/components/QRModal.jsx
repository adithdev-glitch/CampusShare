import React, { useState, useEffect } from 'react';
import { QrCode, Shield, Check, X, Info, CreditCard, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const QRModal = ({ isOpen, onClose, transaction, type, onSuccess }) => {
  const { token, API_URL } = useAuth();
  const [localTx, setLocalTx] = useState(transaction);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [conditionAfter, setConditionAfter] = useState('Good');

  // Keep localTx in sync with the prop
  useEffect(() => {
    setLocalTx(transaction);
  }, [transaction]);

  if (!isOpen || !localTx) return null;

  const isPaidItem = localTx.resourceId?.isPaid;
  const isPaidPickup = type === 'pickup' && isPaidItem && !localTx.isPaid;

  // Calculate rental duration and amount
  const rentDurationMs = new Date(localTx.expectedReturnDate) - new Date(localTx.createdAt);
  const rentDays = Math.max(1, Math.ceil(rentDurationMs / (1000 * 60 * 60 * 24)));
  const totalAmount = rentDays * (localTx.resourceId?.price || 0);

  // Calculate return overdue days & late fee amount
  const isOverdue = type === 'return' && localTx.expectedReturnDate && new Date() > new Date(localTx.expectedReturnDate);
  const overdueMs = isOverdue ? new Date() - new Date(localTx.expectedReturnDate) : 0;
  const overdueDays = overdueMs > 0 ? Math.ceil(overdueMs / (1000 * 60 * 60 * 24)) : 0;
  const overdueAmount = overdueDays * (localTx.resourceId?.price || 0);
  const isOverduePaidRequired = type === 'return' && isPaidItem && overdueDays > 0 && !localTx.isOverduePaid;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setError('Failed to load Razorpay SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      const orderEndpoint = type === 'pickup'
        ? `${API_URL}/borrows/transaction/${localTx._id}/pay-pickup/order`
        : `${API_URL}/borrows/transaction/${localTx._id}/pay-return/order`;

      const res = await axios.post(orderEndpoint, {}, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });

      if (!res.data.success) {
        setError(res.data.message || 'Failed to create payment order.');
        setLoading(false);
        return;
      }

      const { orderId, amount, currency, key } = res.data;

      const options = {
        key: key,
        amount: amount * 100,
        currency: currency,
        name: 'CampusShare Network',
        description: type === 'pickup' ? 'Resource Rental Checkout' : 'Overdue Late Return Fee',
        image: 'https://images.unsplash.com/photo-1517055720730-0766be088582?auto=format&fit=crop&q=80&w=100',
        order_id: orderId,
        handler: async (response) => {
          try {
            setLoading(true);
            const verifyEndpoint = type === 'pickup'
              ? `${API_URL}/borrows/transaction/${localTx._id}/pay-pickup/verify`
              : `${API_URL}/borrows/transaction/${localTx._id}/pay-return/verify`;

            const payload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            };

            if (type === 'return') {
              payload.conditionAfter = conditionAfter;
            }

            const verifyRes = await axios.post(verifyEndpoint, payload, {
              headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
            });

            if (verifyRes.data.success) {
              setLocalTx(verifyRes.data.transaction);
              onSuccess();
              setLoading(false);
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            setError(verifyErr.response?.data?.message || 'Payment verification failed.');
            setLoading(false);
          }
        },
        prefill: {
          name: localTx.borrowerId?.name || '',
          email: localTx.borrowerId?.email || '',
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled by user.');
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to initiate Razorpay checkout.');
      setLoading(false);
    }
  };

  const handleSimulateScan = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = type === 'pickup'
        ? `${API_URL}/borrows/transaction/${localTx._id}/verify-pickup`
        : `${API_URL}/borrows/transaction/${localTx._id}/verify-return`;

      const payload = type === 'return' ? { conditionAfter } : {};

      const res = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200/80 shadow-premium relative text-left">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 font-outfit">Verification Success!</h3>
            <p className="text-sm text-slate-500 mt-2">Transaction status successfully updated.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-900 font-outfit text-center mb-2">
              {type === 'pickup' ? 'Verify Resource Pickup' : 'Verify Resource Return'}
            </h3>
            
            <p className="text-xs text-slate-500 text-center mb-6">
              {type === 'pickup' 
                ? 'Lender displays this QR code to the borrower to scan during hand-over.' 
                : 'Borrower returns the resource and the owner scans the return QR to complete transaction.'}
            </p>

            {/* QR Mock graphic box */}
            {(!isPaidPickup && !isOverduePaidRequired) && (
              <div className="w-48 h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center p-4 relative mb-6 shadow-inner animate-in zoom-in duration-300">
                <div className="absolute inset-2 bg-white flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100">
                  <QrCode className="w-24 h-24 text-slate-900" />
                  <span className="text-[10px] text-indigo-600 font-mono tracking-widest uppercase mt-2">
                    {localTx.qrCode?.substring(0, 12)}
                  </span>
                </div>
              </div>
            )}

            {/* Price Information Callout */}
            {isPaidPickup && (
              <div className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl mb-5 flex items-start space-x-3 text-xs text-slate-600">
                <CreditCard className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block uppercase text-[9px] tracking-wide">Lending Charges</span>
                  <span>Daily Rate: ₹{localTx.resourceId?.price}/day</span>
                  <span className="block font-semibold mt-1">Total Fee: ₹{totalAmount} (for {rentDays} days)</span>
                </div>
              </div>
            )}

            {isOverduePaidRequired && (
              <div className="w-full p-4 bg-rose-50/60 border border-rose-100 rounded-2xl mb-5 flex items-start space-x-3 text-xs text-slate-600">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-rose-800 block uppercase text-[9px] tracking-wide">Overdue Fee Pending</span>
                  <span>Daily Late Fee: ₹{localTx.resourceId?.price}/day</span>
                  <span className="block font-semibold mt-1 text-rose-700">Late Fee Due: ₹{overdueAmount} (for {overdueDays} days late)</span>
                </div>
              </div>
            )}

            {/* If return and paid, show condition selector */}
            {type === 'return' && (!isOverduePaidRequired) && (
              <div className="w-full mb-6 text-left">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Resource Return Condition
                </label>
                <select
                  value={conditionAfter}
                  onChange={(e) => setConditionAfter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-white"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Needs Repair">Needs Repair</option>
                </select>
              </div>
            )}

            {error && (
              <div className="mb-4 w-full p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center space-x-1.5">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment vs simulation button rendering */}
            {isPaidPickup ? (
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/10 cursor-pointer font-outfit"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Rental Fee (₹{totalAmount})</span>
                  </>
                )}
              </button>
            ) : isOverduePaidRequired ? (
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/10 cursor-pointer font-outfit"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Late Fee (₹{overdueAmount})</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSimulateScan}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/10 cursor-pointer font-outfit"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Simulate Scanner Verification</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="mt-3 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Close and scan later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRModal;
