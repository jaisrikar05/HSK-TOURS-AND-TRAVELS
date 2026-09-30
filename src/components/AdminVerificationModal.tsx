import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShieldCheck, Lock, User, KeyRound, CheckCircle2, ShieldAlert, 
  ArrowRight, Mail, RefreshCw, ArrowLeft, Sparkles, Check, Info, Shield
} from 'lucide-react';

interface AdminVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessfulAuth: (token: string, username: string, email: string) => void;
  initialEmail?: string;
}

export const AdminVerificationModal: React.FC<AdminVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccessfulAuth,
  initialEmail = '9158.jaisrikargkky@gmail.com',
}) => {
  // Step state: 'credentials' (Step 1) | 'verification' (Step 2)
  const [currentStep, setCurrentStep] = useState<'credentials' | 'verification'>('credentials');

  // Step 1 Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 Form state
  const [sessionId, setSessionId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  // Timer & Resend state
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfoMessage, setSuccessInfoMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Focus code input on entering Step 2
  useEffect(() => {
    if (currentStep === 'verification') {
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 150);
    }
  }, [currentStep]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Session expiry timer
  useEffect(() => {
    if (currentStep !== 'verification' || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep, timeRemaining]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // STEP 1: Submit Credentials & Request 2-Step Code to Gmail
  const handleRequestTwoFactorCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfoMessage('');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername) {
      setErrorMessage('Please enter your admin username.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Please enter your admin password.');
      return;
    }

    if (!cleanEmail) {
      setErrorMessage('Please enter your Gmail address for receiving the two-step verification code.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/request-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
          email: cleanEmail,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.warn('Response parsing error:', parseErr);
      }

      if (data && data.success && data.sessionId) {
        setSessionId(data.sessionId);
        setEmailSent(true);
        setTimeRemaining(data.expiresInSeconds || 600);
        setResendCooldown(30); // 30s cooldown before resend
        setVerificationCode('');
        setCurrentStep('verification');
      } else {
        setErrorMessage(data?.message || 'Failed to send verification code. Please verify your credentials and SMTP settings.');
      }
    } catch (err: any) {
      console.error('Error requesting 2FA code:', err);
      setErrorMessage(err?.message || 'Error requesting verification code. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify 6-Digit Code received on Gmail
  const handleVerifyTwoFactorCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfoMessage('');

    const cleanCode = verificationCode.trim().replace(/\s+/g, '');

    if (!cleanCode) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    if (cleanCode.length !== 6) {
      setErrorMessage('Verification code must be exactly 6 digits.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          code: cleanCode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccessfulAuth(data.token || `hsk_admin_${Date.now()}`, username.trim(), email.trim());
          setIsSuccess(false);
          // Clear credentials completely
          setUsername('');
          setPassword('');
          setVerificationCode('');
          setCurrentStep('credentials');
          onClose();
        }, 900);
      } else {
        setErrorMessage(data.message || 'Incorrect verification code. Please check your Gmail and try again.');
      }
    } catch (err) {
      console.error('Error verifying 2FA code:', err);
      setErrorMessage('Failed to verify code. Please check your Gmail for the latest code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalDismiss = () => {
    setUsername('');
    setPassword('');
    setVerificationCode('');
    setCurrentStep('credentials');
    setErrorMessage('');
    setSuccessInfoMessage('');
    onClose();
  };

  // RESEND CODE HANDLER
  const handleResendCode = async () => {
    if (resendCooldown > 0 || !sessionId || isLoading) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/resend-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.warn('Response parsing error:', parseErr);
      }

      if (data && data.success) {
        setEmailSent(true);
        setResendCooldown(45);
        setTimeRemaining(600);
        setSuccessInfoMessage(data.message || `A new verification code was sent to ${email}.`);
      } else {
        setErrorMessage(data?.message || 'Could not resend code. Please restart login.');
      }
    } catch (err: any) {
      console.error('Error resending 2FA code:', err);
      setErrorMessage(err?.message || 'Error resending code. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 text-slate-900 relative overflow-hidden">
        
        {/* Top Decorative Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-700" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl border border-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-amber-600 uppercase tracking-wider block">
                  RESTRICTED OPERATOR ACCESS
                </span>
                <span className="text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.2 rounded-full uppercase">
                  2-STEP AUTH
                </span>
              </div>
              <h3 className="font-black text-lg text-slate-900 font-['Manrope']">
                {currentStep === 'credentials' ? 'Admin Dashboard Login' : 'Two-Step Verification'}
              </h3>
            </div>
          </div>

          <button
            onClick={handleModalDismiss}
            className="text-slate-400 hover:text-black font-bold p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP PROGRESS INDICATOR */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
            currentStep === 'credentials' ? 'bg-amber-600' : 'bg-emerald-600'
          }`} />
          <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
            currentStep === 'verification' ? 'bg-amber-600' : 'bg-slate-200'
          }`} />
        </div>

        {/* SUCCESS STATE */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-slate-900 font-['Manrope']">
              Two-Step Verification Successful!
            </h4>
            <p className="text-xs text-slate-600 font-bold">
              Accessing HSK Admin Dashboard & Fleet Operations...
            </p>
          </div>
        ) : currentStep === 'credentials' ? (
          /* ========================================================================= */
          /* STEP 1: CREDENTIALS & GMAIL DISPATCH TARGET                               */
          /* ========================================================================= */
          <form onSubmit={handleRequestTwoFactorCode} className="space-y-4 text-xs">
            
            {/* Operator Notice Banner */}
            <div className="bg-amber-50/90 border border-amber-200 p-3.5 rounded-2xl text-[11px] text-amber-950 font-medium space-y-1">
              <div className="flex items-center justify-between font-black text-amber-950">
                <span className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  Step 1 of 2: Operator Credentials
                </span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md font-mono font-bold">
                  2FA Active
                </span>
              </div>
              <p className="text-slate-700">
                A 6-digit one-time security code will be sent to the given Gmail address each time you log in to verify your identity.
              </p>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-900 border border-rose-200 rounded-2xl text-xs font-bold flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block font-black text-slate-800 text-xs">
                Admin Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="Enter admin username"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-amber-600 focus:bg-white transition"
                  required
                />
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block font-black text-slate-800 text-xs">
                Admin Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-amber-600 focus:bg-white transition"
                  required
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[10px] font-black text-slate-500 hover:text-slate-900 py-1 px-1.5 rounded bg-slate-200/60 cursor-pointer"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Gmail Field for Two-Step Code */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-black text-slate-800 text-xs flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-700" />
                  <span>Gmail for 2-Step Verification Code *</span>
                </label>
                <span className="text-[10px] font-bold text-slate-500">
                  Verification Destination
                </span>
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="name@gmail.com"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-amber-600 focus:bg-white transition"
                  required
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                The 6-digit one-time code will be dispatched to this Gmail address.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-amber-400 font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 border border-slate-800 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Generating & Sending 2-Step Code...</span>
                </span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Verify Credentials & Send Code</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ========================================================================= */
          /* STEP 2: ENTER 6-DIGIT VERIFICATION CODE RECEIVED ON GMAIL                */
          /* ========================================================================= */
          <form onSubmit={handleVerifyTwoFactorCode} className="space-y-4 text-xs">
            
            {/* Back to Step 1 Button & Step indicator */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep('credentials');
                  setErrorMessage('');
                  setSuccessInfoMessage('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email / Back</span>
              </button>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Step 2 of 2
              </span>
            </div>

            {/* Destination Highlight Box */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                  <Mail className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                    Verification code sent to Gmail:
                  </span>
                  <span className="font-mono font-black text-xs text-slate-900 break-all">
                    {email}
                  </span>
                </div>
              </div>

              {/* Real Email delivery feedback status */}
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verification code sent to your Gmail inbox. Please check your inbox and spam folder.</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-900 border border-rose-200 rounded-2xl text-xs font-bold flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Info Message */}
            {successInfoMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-bold flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successInfoMessage}</span>
              </div>
            )}

            {/* 6-DIGIT CODE INPUT */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-black text-slate-800 text-xs">
                  Enter 6-Digit Passcode *
                </label>
                <span className="font-mono font-bold text-[11px] text-slate-500">
                  Expires in: <span className="text-amber-700 font-black">{formatTimer(timeRemaining)}</span>
                </span>
              </div>

              <div className="relative">
                <input
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setVerificationCode(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••"
                  className="w-full text-center text-2xl sm:text-3xl font-mono font-black tracking-[0.4em] py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white transition"
                  required
                />
              </div>
              <p className="text-[11px] text-center text-slate-500 font-medium">
                Enter the 6 numbers received in your Gmail inbox.
              </p>
            </div>

            {/* Resend Code Section */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                disabled={resendCooldown > 0 || isLoading}
                onClick={handleResendCode}
                className="text-xs font-black text-indigo-700 hover:text-indigo-900 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code to Gmail'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep('credentials');
                  setVerificationCode('');
                  setErrorMessage('');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Wrong email?
              </button>
            </div>

            {/* Confirm Button */}
            <button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 border border-transparent disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Code...</span>
                </span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Confirm & Access Admin Dashboard</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
