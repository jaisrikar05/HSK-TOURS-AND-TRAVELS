import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { UserRole } from '../types';
import { X, CheckCircle, UserPlus, LogIn, ShieldCheck, Mail, Lock, User, Phone, Building } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  targetRole?: UserRole;
  onClose: () => void;
  onSuccessfulAuth?: (role: UserRole) => void;
  onOpenAdminAuth?: (email?: string) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  initialMode = 'signin',
  targetRole = 'customer',
  onClose,
  onSuccessfulAuth,
  onOpenAdminAuth,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(targetRole);

  useEffect(() => {
    setSelectedRole(targetRole);
  }, [targetRole]);

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [travelerType, setTravelerType] = useState('Individual Traveler');

  const [authSuccess, setAuthSuccess] = useState<'signin' | 'signup' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (signInEmail && signInPassword) {
      if (selectedRole === 'admin') {
        if (onOpenAdminAuth) {
          onClose();
          onOpenAdminAuth(signInEmail);
          return;
        }
      }
      setAuthSuccess('signin');
    } else {
      setErrorMessage('Please enter both email and password.');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !signUpEmail || !phone || !signUpPassword) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (signUpPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setAuthSuccess('signup');
  };

  const resetForm = () => {
    if (authSuccess && onSuccessfulAuth) {
      onSuccessfulAuth(selectedRole);
    }
    setAuthSuccess(null);
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-300 text-black">
        {/* Header with Logo & Close */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <Logo showText={false} className="h-8" lightMode={false} />
          <button
            onClick={resetForm}
            className="text-slate-500 hover:text-black font-bold text-sm cursor-pointer p-1 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!authSuccess ? (
          <>
            {/* Portal Role Selector */}
            <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-300 text-xs font-black">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('customer');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedRole === 'customer'
                    ? 'bg-indigo-700 text-white shadow-md'
                    : 'text-slate-700 hover:text-black'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer Portal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setErrorMessage('');
                  if (mode === 'signup') setMode('signin');
                }}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedRole === 'admin'
                    ? 'bg-amber-700 text-white shadow-md'
                    : 'text-slate-700 hover:text-black'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Access</span>
              </button>
            </div>

            {/* Mode Tabs */}
            {selectedRole === 'customer' && (
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-black">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage('');
                  }}
                  className={`py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'signin'
                      ? 'bg-white text-indigo-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage('');
                  }}
                  className={`py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'signup'
                      ? 'bg-white text-rose-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>New Customer</span>
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-100 text-rose-950 border border-rose-300 rounded-xl text-xs font-black">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
                <div className="text-center space-y-1">
                  <h3 className="font-black text-lg text-black font-['Manrope']">
                    {selectedRole === 'admin' ? 'Admin Fleet Control Sign In' : 'Welcome to Customer Dashboard'}
                  </h3>
                  <p className="text-slate-700 font-bold">
                    {selectedRole === 'admin'
                      ? 'Two-step verification code will be sent to your Gmail on sign in.'
                      : 'Access your saved trip vouchers, AI itineraries & bus bookings'}
                  </p>
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-700" />
                    <span>{selectedRole === 'admin' ? 'Admin Operator Gmail / Username' : 'Email Address'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder={selectedRole === 'admin' ? '9158.jaisrikargkky@gmail.com' : 'name@company.com'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-indigo-700" />
                    <span>{selectedRole === 'admin' ? 'Admin Password / PIN' : 'Password'}</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md ${
                    selectedRole === 'admin' ? 'bg-amber-700 hover:bg-amber-800' : 'bg-indigo-700 hover:bg-indigo-800'
                  }`}
                >
                  {selectedRole === 'admin' ? 'Proceed to Two-Step Verification →' : 'Sign In to Customer Portal'}
                </button>
              </form>
            )}

            {/* SIGN UP FORM (Customer Only) */}
            {mode === 'signup' && selectedRole === 'customer' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5 text-xs">
                <div className="text-center space-y-0.5">
                  <h3 className="font-black text-lg text-black font-['Manrope']">
                    Create New Customer Account
                  </h3>
                  <p className="text-slate-800 font-bold text-[11px]">
                    Unlock priority booking, corporate discounts & instant quotes
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-800 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-rose-700" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Anish Kumar"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-rose-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-800 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-rose-700" />
                      <span>Mobile Number *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-rose-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-rose-700" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-rose-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-800 mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-rose-700" />
                      <span>Password *</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-rose-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-800 mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-rose-700" />
                      <span>Confirm Password *</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-rose-600 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-700 hover:bg-rose-800 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                >
                  Register Customer Account
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-300 shadow-md">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="font-black text-xl text-black font-['Manrope']">
                {selectedRole === 'admin' ? 'Admin Access Authorized!' : 'Welcome Back!'}
              </h4>
              <p className="text-xs text-slate-800 font-bold">
                {selectedRole === 'admin'
                  ? 'Switched to Admin Fleet Operations Dashboard.'
                  : `Successfully logged in as ${signInEmail || fullName || 'Customer'}.`}
              </p>
            </div>

            <button
              onClick={resetForm}
              className={`font-black px-8 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md transition text-white ${
                selectedRole === 'admin' ? 'bg-amber-700 hover:bg-amber-800' : 'bg-indigo-700 hover:bg-indigo-800'
              }`}
            >
              Open {selectedRole === 'admin' ? 'Admin Control Center' : 'Customer Dashboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


