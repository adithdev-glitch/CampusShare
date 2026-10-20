import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, BookOpen, GraduationCap, ClipboardList, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

const departments = ['CSE', 'ECE', 'EEE', 'Mechanical', 'IT', 'Civil'];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const Register = () => {
  const { register, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: 'CSE',
    year: '1st Year',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification state
  const [verificationPending, setVerificationPending] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, registerNumber, department, year, password, confirmPassword } = formData;

    if (!name || !email || !registerNumber || !department || !year || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailLower = email.toLowerCase();
    const collegeDomainRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in|org|com)$/;
    if (!collegeDomainRegex.test(emailLower)) {
      setError('Please register with a valid college email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await register({
      name,
      email: emailLower,
      registerNumber,
      department,
      year,
      password
    });
    setLoading(false);

    if (result.success) {
      setVerificationPending(true);
    } else {
      setError(result.message);
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

    const result = await verifyOTP(formData.email, otpCode);
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
    const result = await resendOTP(formData.email);
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

      <div className="w-full max-w-lg z-10 text-left">
        {!verificationPending ? (
          /* Registration Form Card */
          <div className="glass-card p-8 rounded-3xl shadow-premium border border-slate-200 bg-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-outfit">
                Create Student Account
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                Register using your university identity details
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Alex Mercer"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                    />
                  </div>
                </div>

                {/* College Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    College Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="alex@university.edu"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Register Number */}
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Register Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="registerNumber"
                      required
                      placeholder="RA2211..."
                      value={formData.registerNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm appearance-none"
                    >
                      {departments.map((dept, idx) => (
                        <option key={idx} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Study Year */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Study Year
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm appearance-none"
                    >
                      {years.map((y, idx) => (
                        <option key={idx} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/10 active:scale-98 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <span className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Sign In
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
                Verify Your Student Email
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                A 6-digit OTP code has been sent to <strong className="text-slate-800">{formData.email}</strong>.
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
                onClick={() => setVerificationPending(false)}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Back to Registration details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
