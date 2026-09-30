import React, { useState } from 'react';
import { PlannedTrip, PaymentRecord, PaymentMode } from '../types';
import { 
  X, CheckCircle2, ShieldCheck, Lock, CreditCard, Smartphone, 
  Building2, Wallet, QrCode, Copy, Check, ArrowRight, Printer, 
  Download, FileText, AlertCircle, Sparkles, RefreshCw
} from 'lucide-react';

interface OnlinePaymentModalProps {
  trip: PlannedTrip;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (record: PaymentRecord, updatedTrip: PlannedTrip) => void;
}

export const OnlinePaymentModal: React.FC<OnlinePaymentModalProps> = ({
  trip,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [platform, setPlatform] = useState<string>('gpay');
  const [paymentType, setPaymentType] = useState<'full' | 'advance'>('full');
  
  // UPI Form state
  const [upiId, setUpiId] = useState('');
  const [showQr, setShowQr] = useState(false);

  // Card Form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // Net Banking Form state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Wallet Form state
  const [selectedWallet, setSelectedWallet] = useState('paytm_wallet');
  const [walletPhone, setWalletPhone] = useState('98450 11234');

  // Bank Transfer (NEFT/RTGS) state
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Promo Code state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Processing & Confirmation state
  const [step, setStep] = useState<'form' | 'otp' | 'processing' | 'success'>('form');
  const [otpValue, setOtpValue] = useState('');
  const [processingMsg, setProcessingMsg] = useState('Establishing 256-bit Encrypted Banking Session...');
  const [completedRecord, setCompletedRecord] = useState<PaymentRecord | null>(null);
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);

  if (!isOpen) return null;

  // Calculation Math
  const baseCost = trip.totalCost;
  const gstRate = 0.05; // 5% GST for passenger transport services
  const gstAmount = Math.round(baseCost * gstRate);
  const rawTotal = baseCost + gstAmount;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalFullTotal = Math.max(100, rawTotal - discountAmount);
  
  // Advance is 25% of final total (rounded to nearest 100)
  const advanceAmount = Math.round((finalFullTotal * 0.25) / 100) * 100;
  const payableAmount = paymentType === 'full' ? finalFullTotal : advanceAmount;
  const balanceRemaining = paymentType === 'advance' ? (finalFullTotal - advanceAmount) : 0;

  // Formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'HSKFIRST') {
      setAppliedCoupon({ code: 'HSKFIRST', discount: 1000 });
    } else if (code === 'SUMMER2026') {
      const disc = Math.round(baseCost * 0.1); // 10%
      setAppliedCoupon({ code: 'SUMMER2026', discount: Math.min(2500, disc) });
    } else if (code === 'CORP500') {
      setAppliedCoupon({ code: 'CORP500', discount: 500 });
    } else {
      setCouponError('Invalid promo code. Try HSKFIRST or SUMMER2026');
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Process transaction
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();

    // If card payment, simulate 3D Secure OTP step
    if (paymentMode === 'card') {
      setStep('otp');
      return;
    }

    executeProcessing();
  };

  const executeProcessing = async () => {
    setStep('processing');

    const steps = [
      'Establishing 256-bit Encrypted Banking Session...',
      'Routing to National Payments Corporation of India (NPCI) Gateway...',
      'Authenticating Payment Credentials with Issuing Bank...',
      'Payment Approved! Generating Digital Tax Voucher...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingMsg(steps[i]);
      await new Promise((r) => setTimeout(r, 650));
    }

    // Determine platform label
    let platformLabel = 'Online Gateway';
    if (paymentMode === 'upi') {
      if (platform === 'gpay') platformLabel = 'Google Pay UPI';
      else if (platform === 'phonepe') platformLabel = 'PhonePe UPI';
      else if (platform === 'paytm') platformLabel = 'Paytm UPI';
      else if (platform === 'bhim') platformLabel = 'BHIM UPI';
      else platformLabel = `UPI (${upiId || 'Direct QR'})`;
    } else if (paymentMode === 'card') {
      const last4 = cardNumber.replace(/\s/g, '').slice(-4) || '8814';
      platformLabel = `Card (Ending •••• ${last4})`;
    } else if (paymentMode === 'netbanking') {
      platformLabel = `${selectedBank} NetBanking`;
    } else if (paymentMode === 'wallet') {
      platformLabel = selectedWallet === 'paytm_wallet' ? 'Paytm Wallet' : selectedWallet === 'phonepe_wallet' ? 'PhonePe Wallet' : 'Amazon Pay';
    } else if (paymentMode === 'bank_transfer') {
      platformLabel = `Corporate Wire (UTR: ${utrNumber || 'NEFT99201'})`;
    }

    const txnId = `TXN-HSK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    const invoiceNum = `HSK-INV-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      tripId: trip.id,
      tripTitle: trip.title,
      amount: payableAmount,
      paymentMode,
      platform: platformLabel,
      transactionId: txnId,
      date: formattedDate,
      status: 'SUCCESS',
      paymentType,
      customerName: 'Traveler Customer',
      customerPhone: '+91 98450 11234',
      receiptNumber: invoiceNum,
      gstAmount: Math.round(gstAmount * (payableAmount / rawTotal)),
      discountApplied: discountAmount
    };

    // Updated trip
    const updatedTrip: PlannedTrip = {
      ...trip,
      status: 'Confirmed',
      paymentStatus: paymentType === 'full' ? 'Paid' : 'Advance Paid',
      paidAmount: (trip.paidAmount || 0) + payableAmount,
      paymentMethod: platformLabel,
      transactionId: txnId,
      paymentDate: formattedDate,
    };

    // Optionally ping backend payment logger
    try {
      fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      }).catch(() => {});
    } catch {}

    setCompletedRecord(newRecord);
    onPaymentSuccess(newRecord, updatedTrip);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border-2 border-slate-300 text-black overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base uppercase tracking-wide font-['Manrope']">
                  HSK Secure Online Payment
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  256-Bit SSL
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-bold">
                Trip Ref: <span className="text-amber-400 font-mono">{trip.id}</span> • {trip.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* STEP 1: PAYMENT FORM */}
          {step === 'form' && (
            <div className="space-y-5">
              
              {/* TRIP SUMMARY & AMOUNT BADGE */}
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                    RESERVED VEHICLE & ITINERARY
                  </span>
                  <h4 className="font-black text-sm text-black uppercase">{trip.title}</h4>
                  <p className="text-slate-700 font-bold text-[11px]">
                    Coach: <span className="text-black font-extrabold">{trip.vehicleName}</span> • {trip.dates} ({trip.guestsCount} Guests)
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-sm text-right shrink-0 w-full sm:w-auto">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Payable Now</span>
                  <span className="text-xl sm:text-2xl font-black text-indigo-950 font-mono">
                    ₹{payableAmount.toLocaleString('en-IN')}
                  </span>
                  {paymentType === 'advance' && (
                    <span className="block text-[10px] font-bold text-amber-800">
                      Balance ₹{balanceRemaining.toLocaleString('en-IN')} on boarding
                    </span>
                  )}
                </div>
              </div>

              {/* PAYMENT TYPE SELECTOR (FULL VS 25% ADVANCE) */}
              <div>
                <label className="block text-xs font-black text-black uppercase mb-2">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer text-left ${
                      paymentType === 'full'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs uppercase">Full Payment (100%)</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-300">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700">
                      Pay ₹{finalFullTotal.toLocaleString('en-IN')} now to receive instant confirmed journey pass & fuel voucher.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('advance')}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer text-left ${
                      paymentType === 'advance'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs uppercase">Advance Token (25%)</span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                        Flexible
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700">
                      Pay ₹{advanceAmount.toLocaleString('en-IN')} now to lock vehicle & driver. Balance on departure.
                    </p>
                  </button>
                </div>
              </div>

              {/* PAYMENT MODES / PLATFORMS TABS */}
              <div>
                <label className="block text-xs font-black text-black uppercase mb-2">
                  Choose Online Payment Mode
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'upi', label: 'UPI / Apps', icon: Smartphone, desc: 'GPay, PhonePe, QR' },
                    { id: 'card', label: 'Cards', icon: CreditCard, desc: 'Visa, RuPay, MC' },
                    { id: 'netbanking', label: 'Net Banking', icon: Building2, desc: 'All Indian Banks' },
                    { id: 'wallet', label: 'Wallets', icon: Wallet, desc: 'Paytm, Amazon' },
                    { id: 'bank_transfer', label: 'NEFT / RTGS', icon: FileText, desc: 'Corporate Wire' },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMode(m.id as PaymentMode)}
                        className={`p-2.5 rounded-xl border-2 flex flex-col items-center text-center transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-700 bg-indigo-900 text-white shadow-md'
                            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-black'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-amber-300' : 'text-indigo-800'}`} />
                        <span className="font-black text-[11px] uppercase leading-tight">{m.label}</span>
                        <span className={`text-[9px] mt-0.5 font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {m.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC FORM FOR SELECTED PAYMENT MODE */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border-2 border-slate-300 space-y-4">
                
                {/* 1. UPI PLATFORMS */}
                {paymentMode === 'upi' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs uppercase text-slate-800">Select UPI Platform</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        Zero Gateway Surcharge
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'gpay', name: 'Google Pay', badge: 'GPay', color: 'bg-white text-slate-900 border-slate-300' },
                        { id: 'phonepe', name: 'PhonePe', badge: 'पे PhonePe', color: 'bg-white text-indigo-900 border-indigo-200' },
                        { id: 'paytm', name: 'Paytm UPI', badge: 'Paytm', color: 'bg-white text-cyan-900 border-cyan-200' },
                        { id: 'bhim', name: 'BHIM UPI', badge: 'BHIM', color: 'bg-white text-emerald-900 border-emerald-200' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPlatform(p.id);
                            setShowQr(false);
                          }}
                          className={`p-3 rounded-xl border-2 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
                            platform === p.id && !showQr
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className="font-extrabold">{p.badge}</span>
                        </button>
                      ))}
                    </div>

                    {/* QR Code toggle vs Enter UPI ID */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                      <span className="font-black text-xs text-black">Payment Method</span>
                      <button
                        type="button"
                        onClick={() => setShowQr(!showQr)}
                        className="text-indigo-800 hover:text-indigo-950 font-black text-xs flex items-center gap-1.5 cursor-pointer underline uppercase"
                      >
                        <QrCode className="w-3.5 h-3.5 text-indigo-700" />
                        <span>{showQr ? 'Enter UPI ID instead' : 'Generate Dynamic QR Code'}</span>
                      </button>
                    </div>

                    {showQr ? (
                      <div className="bg-white p-4 rounded-2xl border-2 border-indigo-200 flex flex-col items-center justify-center text-center space-y-2">
                        <div className="p-2 bg-slate-900 rounded-xl inline-block shadow-md">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=hsktours@oksbi&pn=HSKToursAndTravels&am=${payableAmount}&tn=Booking-${trip.id}&cu=INR`}
                            alt="HSK UPI QR Code"
                            className="w-36 h-36 rounded-lg bg-white p-1"
                          />
                        </div>
                        <p className="font-black text-xs text-black uppercase">
                          Scan with Any UPI App (GPay, PhonePe, Paytm)
                        </p>
                        <p className="text-[11px] text-slate-600 font-bold">
                          Exact Amount: <span className="text-black font-black">₹{payableAmount.toLocaleString('en-IN')}</span> • Ref: {trip.id}
                        </p>
                        <button
                          type="button"
                          onClick={executeProcessing}
                          className="mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-md"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simulate QR Payment Done</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="block font-black text-slate-800 text-[11px] uppercase">
                          Enter Your Virtual Payment Address (UPI ID)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="e.g. yourname@oksbi or mobile@paytm"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600 text-xs"
                          />
                          <span className="absolute right-3 top-3 text-[10px] font-black text-slate-500 uppercase">
                            Verified NPCI
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {['@oksbi', '@okhdfcbank', '@paytm', '@ybl'].map((h) => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => {
                                const base = upiId.split('@')[0] || 'traveler';
                                setUpiId(`${base}${h}`);
                              }}
                              className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded cursor-pointer"
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. DEBIT & CREDIT CARDS */}
                {paymentMode === 'card' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs uppercase text-slate-800">Card Credentials</span>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600">
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded font-black">VISA</span>
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-900 rounded font-black">MasterCard</span>
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded font-black">RuPay</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-black text-slate-800 text-[11px] uppercase mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="4532 8810 9920 4242"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-black font-mono font-bold focus:outline-none focus:border-indigo-600 text-xs tracking-wider"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block font-black text-slate-800 text-[11px] uppercase mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SURESH KUMAR"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600 text-xs uppercase"
                        />
                      </div>

                      <div>
                        <label className="block font-black text-slate-800 text-[11px] uppercase mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="08/28"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-black font-mono font-bold focus:outline-none focus:border-indigo-600 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-black text-slate-800 text-[11px] uppercase mb-1">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-black font-mono font-bold focus:outline-none focus:border-indigo-600 text-xs"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-slate-700">
                        Securely tokenize card for 1-click checkout as per RBI guidelines
                      </span>
                    </label>
                  </div>
                )}

                {/* 3. NET BANKING */}
                {paymentMode === 'netbanking' && (
                  <div className="space-y-3">
                    <span className="font-black text-xs uppercase text-slate-800 block">Popular Indian Banks</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'HDFC Bank', 'State Bank of India', 'ICICI Bank', 
                        'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'
                      ].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-xl border-2 font-black text-xs text-left cursor-pointer transition ${
                            selectedBank === bank
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-extrabold shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="block font-black text-slate-800 text-[11px] uppercase mb-1">
                        Or Select Other Bank (40+ Supported)
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600 text-xs"
                      >
                        <option value="Canara Bank">Canara Bank</option>
                        <option value="Bank of Baroda">Bank of Baroda</option>
                        <option value="Union Bank of India">Union Bank of India</option>
                        <option value="IndusInd Bank">IndusInd Bank</option>
                        <option value="Federal Bank">Federal Bank</option>
                        <option value="IDFC FIRST Bank">IDFC FIRST Bank</option>
                        <option value="Yes Bank">Yes Bank</option>
                        <option value="Indian Bank">Indian Bank</option>
                        <option value="South Indian Bank">South Indian Bank</option>
                        <option value="Karur Vysya Bank">Karur Vysya Bank</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 4. DIGITAL WALLETS */}
                {paymentMode === 'wallet' && (
                  <div className="space-y-3">
                    <span className="font-black text-xs uppercase text-slate-800 block">Supported Digital Wallets</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'paytm_wallet', name: 'Paytm Wallet' },
                        { id: 'phonepe_wallet', name: 'PhonePe Wallet' },
                        { id: 'amazon_pay', name: 'Amazon Pay' },
                      ].map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setSelectedWallet(w.id)}
                          className={`p-3 rounded-xl border-2 font-black text-xs text-center cursor-pointer transition ${
                            selectedWallet === w.id
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-extrabold shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {w.name}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block font-black text-slate-800 text-[11px] uppercase mb-1">
                        Linked Mobile Number
                      </label>
                      <input
                        type="text"
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value)}
                        className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-black font-mono font-bold focus:outline-none focus:border-indigo-600 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 5. CORPORATE WIRE / NEFT / RTGS */}
                {paymentMode === 'bank_transfer' && (
                  <div className="space-y-3 text-slate-800">
                    <span className="font-black text-xs uppercase text-slate-900 block">
                      HSK Tours & Travels Official Corporate Bank Account
                    </span>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-300 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-slate-600">Beneficiary Name:</span>
                        <div className="flex items-center gap-1.5 font-black text-black">
                          <span>HSK TOURS & TRAVELS PVT LTD</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('HSK TOURS & TRAVELS PVT LTD', 'ben')}
                            className="text-indigo-700 hover:text-black cursor-pointer"
                          >
                            {copiedField === 'ben' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-slate-600">Current Account No:</span>
                        <div className="flex items-center gap-1.5 font-mono font-black text-black">
                          <span>918020088920192</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('918020088920192', 'acc')}
                            className="text-indigo-700 hover:text-black cursor-pointer"
                          >
                            {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-slate-600">IFSC Code:</span>
                        <div className="flex items-center gap-1.5 font-mono font-black text-black">
                          <span>HDFC0001234</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('HDFC0001234', 'ifsc')}
                            className="text-indigo-700 hover:text-black cursor-pointer"
                          >
                            {copiedField === 'ifsc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-600">GSTIN:</span>
                        <span className="font-mono font-black text-black">33AABCH1234F1Z8</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-black text-slate-800 text-[11px] uppercase mb-1">
                        Enter Bank UTR / Transaction Reference Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. UTR-HDFC98210921"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-black font-mono font-bold focus:outline-none focus:border-indigo-600 text-xs uppercase"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PROMO CODE / COUPON VOUCHER */}
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs uppercase text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Have a Promo Code or Corporate Voucher?</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-800">
                    Try: <strong className="font-black">HSKFIRST</strong>
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. HSKFIRST, SUMMER2026)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 p-2 bg-white border border-amber-300 rounded-xl text-black font-mono font-bold uppercase text-xs focus:outline-none focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-black px-4 py-2 rounded-xl text-xs uppercase transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="p-2 bg-emerald-100 text-emerald-950 rounded-lg text-[11px] font-black flex items-center justify-between border border-emerald-300">
                    <span>Coupon "{appliedCoupon.code}" applied! ₹{appliedCoupon.discount} savings</span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-emerald-800 hover:text-emerald-950 underline cursor-pointer text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] font-black text-rose-600">{couponError}</p>
                )}
              </div>

              {/* FARE BREAKDOWN TABLE */}
              <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-300 space-y-2 text-[11px]">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Base Charter / Tour Fare</span>
                  <span className="font-mono">₹{baseCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>GST (5% SAC 9964 Passenger Transport)</span>
                  <span className="font-mono">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between font-black text-emerald-800">
                    <span>Promo Discount ({appliedCoupon.code})</span>
                    <span className="font-mono">-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-300 flex justify-between font-black text-sm text-black">
                  <span>Total Payable Right Now</span>
                  <span className="font-mono text-indigo-950">₹{payableAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border-2 border-slate-300 text-black font-black uppercase tracking-wider text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-black py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/25"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>PAY ₹{payableAmount.toLocaleString('en-IN')} SECURELY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: 3D SECURE OTP SIMULATOR FOR CARDS */}
          {step === 'otp' && (
            <div className="py-6 px-4 space-y-5 text-center max-w-md mx-auto">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-900 rounded-2xl flex items-center justify-center mx-auto border-2 border-indigo-200 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-indigo-700" />
              </div>

              <div>
                <h4 className="font-black text-base text-black uppercase">Bank 3D Secure Verification</h4>
                <p className="text-xs text-slate-600 font-bold mt-1">
                  A high-security one-time password has been sent to your registered mobile ending in <strong>•••• 1234</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-300 text-xs space-y-1">
                <p className="font-bold text-slate-700">Merchant: <strong className="text-black">HSK Tours & Travels Pvt Ltd</strong></p>
                <p className="font-bold text-slate-700">Amount: <strong className="text-black">₹{payableAmount.toLocaleString('en-IN')}</strong></p>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase text-slate-700">
                  Enter 6-Digit Bank OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 782190"
                  className="w-48 mx-auto p-3 text-center tracking-widest text-lg font-mono font-black border-2 border-indigo-600 rounded-xl focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 font-bold">
                  Demo hint: Enter any 6 digits (e.g. 123456)
                </p>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black text-xs uppercase cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={executeProcessing}
                  className="px-6 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-black text-xs uppercase shadow-md cursor-pointer"
                >
                  Submit & Authorize
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REALISTIC PROCESSING INDICATOR */}
          {step === 'processing' && (
            <div className="py-12 px-4 space-y-6 text-center max-w-md mx-auto">
              <div className="relative w-16 h-16 mx-auto">
                <RefreshCw className="w-16 h-16 text-indigo-700 animate-spin" />
                <Lock className="w-6 h-6 text-amber-500 absolute inset-0 m-auto" />
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-base text-black uppercase">Processing Payment</h4>
                <p className="text-xs font-mono font-extrabold text-indigo-900 animate-pulse">
                  {processingMsg}
                </p>
                <p className="text-[10px] text-slate-500 font-bold">
                  Please do not refresh or press back button.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION & INVOICE */}
          {step === 'success' && completedRecord && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border-2 border-emerald-400 p-5 rounded-3xl text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/70 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Payment Successful & Booking Confirmed
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-950 font-['Manrope'] uppercase mt-1">
                    ₹{completedRecord.amount.toLocaleString('en-IN')} Received
                  </h3>
                  <p className="text-xs text-emerald-900 font-bold">
                    Official booking reference: <strong className="font-mono text-black">{completedRecord.transactionId}</strong>
                  </p>
                </div>
              </div>

              {/* RECEIPT / INVOICE PREVIEW CARD */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-md space-y-3 text-xs">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                  <div>
                    <h5 className="font-black text-xs text-black uppercase font-['Manrope']">
                      HSK TOURS & TRAVELS DIGITAL RECEIPT
                    </h5>
                    <p className="text-[10px] text-slate-600 font-bold">GSTIN: 33AABCH1234F1Z8 • SAC: 996412</p>
                  </div>
                  <span className="font-mono text-[11px] font-black text-indigo-950 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                    {completedRecord.receiptNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Itinerary / Trip</span>
                    <strong className="text-black font-black">{completedRecord.tripTitle}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Paid Via Platform</span>
                    <strong className="text-indigo-900 font-black">{completedRecord.platform}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Payment Date & Time</span>
                    <strong className="text-black font-mono font-bold">{completedRecord.date}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Booking Status</span>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-950 border border-emerald-300 uppercase">
                      Confirmed & Dispatched
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-700 font-bold">
                    <span>Amount Received ({completedRecord.paymentType === 'full' ? '100% Full' : '25% Advance'}):</span>
                    <span className="font-mono font-black text-black">₹{completedRecord.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>Includes 5% Central & State GST:</span>
                    <span className="font-mono">₹{completedRecord.gstAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  {completedRecord.paymentType === 'advance' && (
                    <div className="flex justify-between text-amber-800 font-bold pt-1 border-t border-slate-200">
                      <span>Balance on Departure:</span>
                      <span className="font-mono font-black">₹{(finalFullTotal - completedRecord.amount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto flex-1 bg-slate-200 hover:bg-slate-300 text-black font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 border border-slate-300"
                >
                  <Printer className="w-4 h-4 text-indigo-700" />
                  <span>Print Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = `HSK TOURS & TRAVELS - PAYMENT RECEIPT\nReceipt: ${completedRecord.receiptNumber}\nTxn: ${completedRecord.transactionId}\nTrip: ${completedRecord.tripTitle}\nAmount Paid: INR ${completedRecord.amount}\nMode: ${completedRecord.platform}\nDate: ${completedRecord.date}\nStatus: Confirmed`;
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${completedRecord.receiptNumber}.txt`;
                    a.click();
                  }}
                  className="w-full sm:w-auto flex-1 bg-slate-200 hover:bg-slate-300 text-black font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 border border-slate-300"
                >
                  <Download className="w-4 h-4 text-indigo-700" />
                  <span>Download Voucher</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Return to Dashboard</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
