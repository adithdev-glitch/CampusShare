import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification state
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    const emailLower = email.toLowerCase();
    const collegeDomainRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in|org|com)$/;
    if (!collegeDomainRegex.test(emailLower)) {
      setError('Please register or log in with a valid college email address.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(emailLower, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      if (result.requiresVerification) {
        setNeedsVerification(true);
        setEmail(result.email || emailLower);
      } else {
        setError(result.message);
      }
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit verification code.');
      return;
    }

    setOtpError('');
    setOtpLoading(true);

    const result = await verifyOTP(email, otpCode);
    setOtpLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setOtpError(result.message);
    }
  };

  const handleResend = async () => {
    setResendStatus('');
    setOtpError('');
    const result = await resendOTP(email);
    if (result.success) {
      setResendStatus('A new OTP verification code has been sent!');
    } else {
      setOtpError(result.message);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-soft-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl animate-soft-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md z-10 text-left">
        {!needsVerification ? (
          /* Normal Login Card */
          <div className="glass-card p-8 rounded-3xl shadow-premium border border-slate-200 bg-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-outfit">
                Welcome Back
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                Sign in with your college credentials
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  College Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition-all text-sm bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Please contact your administrator to reset password.')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition-all text-sm bg-slate-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/10 active:scale-98 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <span className="text-xs text-slate-500">
                New to CampusShare?{' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Create an account
                </Link>
              </span>
            </div>
          </div>
        ) : (
          /* OTP Card overlay */
          <div className="glass-card p-8 rounded-3xl shadow-premium border-t-4 border-t-indigo-600 border border-slate-200 bg-white">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 animate-bounce">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-outfit">
                Verify Your Account
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                We've sent a 6-digit OTP code to <strong className="text-slate-800">{email}</strong>.
              </p>
            </div>

            {otpError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {resendStatus && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs">
                {resendStatus}
              </div>
            )}

            <form onSubmit={handleOtpVerify} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 text-center">
                  Verification Code (6 Digits)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center py-3.5 rounded-xl border border-slate-200 text-slate-900 tracking-[0.75em] text-2xl font-bold placeholder-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition-all font-outfit bg-slate-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-98 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {otpLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6 flex flex-col space-y-3">
              <button
                type="button"
                onClick={handleResend}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
              >
                Resend verification email
              </button>
              <button
                type="button"
                onClick={() => setNeedsVerification(false)}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
