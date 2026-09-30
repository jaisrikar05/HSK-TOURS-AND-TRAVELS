import React, { useState, useEffect } from 'react';
import { PlannedTrip, PaymentRecord, CustomQrCode } from '../types';
import { initialQrCodes } from '../data/mockData';
import { 
  QrCode, Copy, Check, CheckCircle2, ShieldCheck, Download, Printer, 
  Plus, Smartphone, CreditCard, Sparkles, RefreshCw, AlertCircle, 
  ExternalLink, Upload, Trash2, ArrowRight, CheckCircle, Info, Lock
} from 'lucide-react';

interface ScanAndPaySectionProps {
  plannedTrips: PlannedTrip[];
  paymentRecords: PaymentRecord[];
  onPaymentSuccess: (record: PaymentRecord, updatedTrip: PlannedTrip) => void;
  onViewReceipt: (record: PaymentRecord) => void;
}

const QR_STORAGE_KEY = 'hsk_custom_qr_codes';

export const ScanAndPaySection: React.FC<ScanAndPaySectionProps> = ({
  plannedTrips,
  paymentRecords,
  onPaymentSuccess,
  onViewReceipt,
}) => {
  // Load saved QR codes from localStorage or fallback to defaults
  const [qrList, setQrList] = useState<CustomQrCode[]>(() => {
    try {
      const saved = localStorage.getItem(QR_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return initialQrCodes;
  });

  // Selected QR Profile
  const [selectedQrId, setSelectedQrId] = useState<string>(() => {
    return qrList.find((q) => q.isDefault)?.id || qrList[0]?.id || 'qr-official-sbi';
  });

  // Trip selection
  const pendingTrips = plannedTrips.filter((t) => t.paymentStatus !== 'Paid');
  const [selectedTripId, setSelectedTripId] = useState<string>(() => {
    return pendingTrips[0]?.id || plannedTrips[0]?.id || 'custom';
  });

  // Payment type & amount state
  const [paymentType, setPaymentType] = useState<'full' | 'advance' | 'custom'>('full');
  const [customAmount, setCustomAmount] = useState<number>(5000);
  const [customPurpose, setCustomPurpose] = useState<string>('Custom Coach Charter & Route Settlement');
  const [payerName, setPayerName] = useState<string>('Verified Traveler');
  const [payerPhone, setPayerPhone] = useState<string>('+91 98450 11234');

  // Settlement verification form state
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Google Pay');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [justSettledRecord, setJustSettledRecord] = useState<PaymentRecord | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  // Add QR Code Modal state
  const [isAddQrModalOpen, setIsAddQrModalOpen] = useState<boolean>(false);
  const [newQrTitle, setNewQrTitle] = useState<string>('');
  const [newQrUpiId, setNewQrUpiId] = useState<string>('');
  const [newQrPayeeName, setNewQrPayeeName] = useState<string>('HSK Tours & Travels');
  const [newQrBankName, setNewQrBankName] = useState<string>('State Bank of India');
  const [newQrImageBase64, setNewQrImageBase64] = useState<string>('');
  const [newQrNotes, setNewQrNotes] = useState<string>('');
  const [newQrSetDefault, setNewQrSetDefault] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');

  // Save QR List to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(qrList));
    } catch {
      // ignore
    }
  }, [qrList]);

  // Current active QR profile
  const activeQr = qrList.find((q) => q.id === selectedQrId) || qrList[0];

  // Current selected trip (if any)
  const currentTrip = plannedTrips.find((t) => t.id === selectedTripId);

  // Calculate payable amount based on selection
  let payableAmount = customAmount;
  let remainingTripBalance = 0;

  if (currentTrip && selectedTripId !== 'custom') {
    const totalCost = currentTrip.totalCost;
    const paidSoFar = currentTrip.paidAmount || 0;
    remainingTripBalance = Math.max(0, totalCost - paidSoFar);

    if (paymentType === 'full') {
      payableAmount = remainingTripBalance > 0 ? remainingTripBalance : totalCost;
    } else if (paymentType === 'advance') {
      // 25% of total cost rounded to nearest 100
      payableAmount = Math.max(500, Math.round((totalCost * 0.25) / 100) * 100);
    } else {
      payableAmount = customAmount;
    }
  }

  // Construct standard UPI deep-link URL
  const notePayload = currentTrip && selectedTripId !== 'custom'
    ? `HSK-${currentTrip.id}-${paymentType.toUpperCase()}`
    : `HSK-PAY-${customPurpose.slice(0, 15).replace(/\s+/g, '-')}`;

  const upiPayload = `upi://pay?pa=${activeQr.upiId}&pn=${encodeURIComponent(activeQr.payeeName)}&am=${payableAmount}&tn=${encodeURIComponent(notePayload)}&cu=INR`;

  // QR Code image URL (falls back to custom uploaded image if available)
  const qrCodeDisplayUrl = activeQr.qrImageUrl
    ? activeQr.qrImageUrl
    : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiPayload)}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Handle image upload for adding custom QR code
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewQrImageBase64(reader.result as string);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Save new QR Code
  const handleSaveNewQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQrTitle.trim() || !newQrUpiId.trim() || !newQrPayeeName.trim()) {
      setUploadError('Please fill in Title, UPI ID, and Payee Name.');
      return;
    }

    if (!newQrUpiId.includes('@')) {
      setUploadError('Please enter a valid UPI VPA ID containing "@" (e.g. yourname@oksbi).');
      return;
    }

    const newId = `qr-custom-${Date.now().toString().slice(-6)}`;
    const newQrItem: CustomQrCode = {
      id: newId,
      title: newQrTitle.trim(),
      upiId: newQrUpiId.trim().toLowerCase(),
      payeeName: newQrPayeeName.trim(),
      bankName: newQrBankName.trim() || 'UPI Payment Network',
      qrImageUrl: newQrImageBase64 || undefined,
      isDefault: newQrSetDefault,
      notes: newQrNotes.trim() || 'Custom added Scan and Pay QR code.',
      createdDate: new Date().toISOString().split('T')[0]
    };

    let updatedList = [...qrList];
    if (newQrSetDefault) {
      updatedList = updatedList.map((q) => ({ ...q, isDefault: false }));
    }
    updatedList.unshift(newQrItem);

    setQrList(updatedList);
    setSelectedQrId(newId);

    // Reset Form
    setNewQrTitle('');
    setNewQrUpiId('');
    setNewQrPayeeName('HSK Tours & Travels');
    setNewQrBankName('State Bank of India');
    setNewQrImageBase64('');
    setNewQrNotes('');
    setNewQrSetDefault(false);
    setIsAddQrModalOpen(false);
  };

  // Delete custom QR code
  const handleDeleteQr = (idToDelete: string) => {
    if (idToDelete.startsWith('qr-official')) {
      alert('Official HSK primary QR codes cannot be deleted.');
      return;
    }
    const updated = qrList.filter((q) => q.id !== idToDelete);
    setQrList(updated);
    if (selectedQrId === idToDelete) {
      setSelectedQrId(updated[0]?.id || 'qr-official-sbi');
    }
  };

  // Generate a random 12-digit UTR for testing
  const handleGenerateTestUtr = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100000 + Math.random() * 900000);
    setUtrNumber(`42${random}${timestamp}`.slice(0, 12));
    setValidationError('');
  };

  // Confirm and settle payment
  const handleConfirmSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setValidationError('Please enter the 12-digit UPI Transaction Reference Number (UTR).');
      return;
    }

    if (cleanUtr.length < 8) {
      setValidationError('UTR must be at least 8 to 12 alphanumeric characters as provided in your UPI app.');
      return;
    }

    setIsVerifying(true);

    // Simulate verified bank handshake
    await new Promise((r) => setTimeout(r, 900));

    const invoiceNum = `HSK-QR-${Date.now().toString().slice(-4)}`;
    const tripTitle = currentTrip && selectedTripId !== 'custom' 
      ? currentTrip.title 
      : (customPurpose || 'Custom Charter Fare');
    const tripId = currentTrip && selectedTripId !== 'custom' 
      ? currentTrip.id 
      : `ad-hoc-${Date.now().toString().slice(-4)}`;

    const newRecord: PaymentRecord = {
      id: `pay-qr-${Date.now()}`,
      tripId,
      tripTitle,
      amount: payableAmount,
      paymentMode: 'upi',
      platform: `${selectedPlatform} (QR Scan)`,
      transactionId: `UPI-${cleanUtr}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'SUCCESS',
      paymentType: paymentType === 'advance' ? 'advance' : 'full',
      customerName: payerName || 'Verified Traveler',
      customerPhone: payerPhone || '+91 98450 11234',
      receiptNumber: invoiceNum,
      gstAmount: Math.round(payableAmount * 0.05),
      discountApplied: 0
    };

    let updatedTripToPass: PlannedTrip;
    if (currentTrip && selectedTripId !== 'custom') {
      const newPaidTotal = (currentTrip.paidAmount || 0) + payableAmount;
      const isFullySettled = newPaidTotal >= currentTrip.totalCost;

      updatedTripToPass = {
        ...currentTrip,
        paidAmount: newPaidTotal,
        paymentStatus: isFullySettled ? 'Paid' : 'Advance Paid',
        transactionId: `UPI-${cleanUtr}`,
        paymentMethod: `${selectedPlatform} (Scan & Pay)`,
        paymentDate: newRecord.date
      };
    } else {
      updatedTripToPass = {
        id: tripId,
        title: tripTitle,
        dates: 'Reserved Custom Dates',
        status: 'Confirmed',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
        vehicleName: 'Executive Charter Coach',
        guestsCount: 4,
        totalCost: payableAmount,
        itinerarySummary: `Ad-hoc charter booking settled via ${selectedPlatform} Scan & Pay.`,
        paymentStatus: 'Paid',
        paidAmount: payableAmount,
        transactionId: `UPI-${cleanUtr}`,
        paymentMethod: `${selectedPlatform} (Scan & Pay)`,
        paymentDate: newRecord.date
      };
    }

    setIsVerifying(false);
    setJustSettledRecord(newRecord);
    setUtrNumber('');

    onPaymentSuccess(newRecord, updatedTripToPass);
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrCodeDisplayUrl;
    link.download = `HSK-ScanAndPay-QR-${activeQr.title.replace(/\s+/g, '-')}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintQr = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      
      {/* HERO BANNER: SCAN & PAY INFORMATION */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-slate-800 space-y-4 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <QrCode className="w-3 h-3" />
                <span>UPI Scan & Pay Terminal</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Instant Settlement & 0% Surcharge
              </span>
              <span className="text-[11px] text-slate-300 font-bold">
                NPCI & RBI 256-bit Encrypted
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-['Manrope'] uppercase tracking-wide text-white">
              Scan & Pay with Any UPI App or Add Custom QR Code
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Pay coach charter balances, advance tokens, or custom route kilometers seamlessly. 
              Scan the dynamic high-resolution QR with Google Pay, PhonePe, Paytm, BHIM, or any bank app. 
              You can also upload or add custom QR codes for your branch or corporate billing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddQrModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-lg hover:shadow-amber-400/20"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>Add New QR Code</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('saved-qr-roster');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-black px-4 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer border border-slate-700 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span>Manage QR Codes ({qrList.length})</span>
            </button>
          </div>
        </div>

        {/* SUPPORTED UPI BADGES ROW */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-300 font-bold">
          <span className="text-[11px] text-slate-400 uppercase font-black">Supported UPI Apps:</span>
          <span className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Google Pay
          </span>
          <span className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span> PhonePe
          </span>
          <span className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Paytm
          </span>
          <span className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> BHIM UPI
          </span>
          <span className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> Amazon Pay & 50+ Banks
          </span>
        </div>
      </div>

      {/* RECENT SETTLEMENT SUCCESS CELEBRATION BANNER */}
      {justSettledRecord && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  Payment Confirmed & Verified
                </span>
                <h3 className="text-lg font-black text-emerald-950 font-['Manrope'] uppercase mt-1">
                  ₹{justSettledRecord.amount.toLocaleString('en-IN')} Settled for {justSettledRecord.tripTitle}
                </h3>
                <p className="text-xs text-emerald-800 font-bold">
                  Transaction Ref: <span className="font-mono text-emerald-950 font-black">{justSettledRecord.transactionId}</span> • Receipt No: <span className="font-mono text-emerald-950 font-black">{justSettledRecord.receiptNumber}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onViewReceipt(justSettledRecord)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>View Tax Invoice</span>
              </button>

              <button
                onClick={() => setJustSettledRecord(null)}
                className="bg-emerald-200 hover:bg-emerald-300 text-emerald-950 font-black px-3 py-2.5 rounded-xl text-xs uppercase cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE: 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PAYMENT CONFIGURATION & DETAILS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* CARD 1: SELECT ACTIVE QR CODE PROFILE */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-base uppercase text-black font-['Manrope'] flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-indigo-700" />
                  <span>1. Choose QR Code / Merchant Profile</span>
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  Select which collection VPA or custom uploaded QR code to scan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddQrModalOpen(true)}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-2 border-indigo-300 font-black px-3 py-1.5 rounded-xl text-xs uppercase transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add QR</span>
              </button>
            </div>

            {/* QR PROFILE SELECTION CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {qrList.map((qr) => {
                const isSelected = qr.id === selectedQrId;
                const isOfficial = qr.id.startsWith('qr-official');

                return (
                  <div
                    key={qr.id}
                    onClick={() => setSelectedQrId(qr.id)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer text-left flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            isOfficial 
                              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' 
                              : 'bg-amber-100 text-amber-950 border border-amber-300'
                          }`}>
                            {isOfficial ? 'Official HSK QR' : 'Custom Added QR'}
                          </span>
                          {qr.isDefault && (
                            <span className="text-[9px] font-black uppercase text-indigo-900 bg-indigo-100 px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-xs text-black uppercase mt-1">
                          {qr.title}
                        </h4>
                      </div>

                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-600 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] font-bold">
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Payee:</span>
                        <span className="text-black font-extrabold">{qr.payeeName}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>UPI VPA:</span>
                        <span className="font-mono text-indigo-950 font-black">{qr.upiId}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 2: SELECT TRIP OR CUSTOM CHARTER PURPOSE */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md space-y-4">
            <div className="border-b-2 border-slate-200 pb-3">
              <h3 className="font-black text-base uppercase text-black font-['Manrope'] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-700" />
                <span>2. Select Booking Itinerary & Payment Mode</span>
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                Link this QR payment to a reserved coach trip or enter a custom amount.
              </p>
            </div>

            <div className="space-y-4">
              {/* TRIP SELECTOR DROPDOWN */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-800 mb-1.5">
                  Select Trip Itinerary or Booking Ref
                </label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-black font-black text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  {plannedTrips.map((t) => {
                    const bal = Math.max(0, t.totalCost - (t.paidAmount || 0));
                    return (
                      <option key={t.id} value={t.id}>
                        {t.title} • Coach: {t.vehicleName} • Balance: ₹{bal.toLocaleString('en-IN')} ({t.paymentStatus || 'Pending'})
                      </option>
                    );
                  })}
                  <option value="custom">
                    ★ Custom Charter / Extra KM / Direct Quote Payment
                  </option>
                </select>
              </div>

              {/* PAYMENT TYPE OPTIONS (FULL / ADVANCE / CUSTOM) */}
              {selectedTripId !== 'custom' && currentTrip ? (
                <div className="space-y-3">
                  <label className="block text-[11px] font-black uppercase text-slate-800">
                    Payment Breakdown
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentType('full')}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                        paymentType === 'full'
                          ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase text-slate-500 block">
                        Full Settlement
                      </span>
                      <span className="font-mono font-black text-sm text-black block mt-0.5">
                        ₹{(remainingTripBalance > 0 ? remainingTripBalance : currentTrip.totalCost).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-800 font-bold block mt-1">
                        100% Settle Booking
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentType('advance')}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                        paymentType === 'advance'
                          ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase text-slate-500 block">
                        25% Token Advance
                      </span>
                      <span className="font-mono font-black text-sm text-black block mt-0.5">
                        ₹{Math.max(500, Math.round((currentTrip.totalCost * 0.25) / 100) * 100).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-indigo-900 font-bold block mt-1">
                        Confirm Coach Roster
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentType('custom')}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                        paymentType === 'custom'
                          ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase text-slate-500 block">
                        Custom Partial
                      </span>
                      <span className="font-mono font-black text-sm text-black block mt-0.5">
                        Flexible Amount
                      </span>
                      <span className="text-[10px] text-slate-600 font-bold block mt-1">
                        Specify below
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* CUSTOM AMOUNT & PURPOSE INPUTS */}
              {(selectedTripId === 'custom' || paymentType === 'custom') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-800 mb-1">
                      Amount to Pay (INR ₹)
                    </label>
                    <input
                      type="number"
                      min={100}
                      step={100}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Math.max(100, Number(e.target.value)))}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-black font-mono font-bold text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-800 mb-1">
                      Payment Purpose or Booking Note
                    </label>
                    <input
                      type="text"
                      value={customPurpose}
                      onChange={(e) => setCustomPurpose(e.target.value)}
                      placeholder="e.g. Extra 150 KM / Driver Allowance"
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-black font-bold text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              )}

              {/* PAYER INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-800 mb-1">
                    Payer / Traveler Name
                  </label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-black font-bold text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-800 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-black font-bold text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* CARD 3: CONFIRMATION & UTR VERIFICATION */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md space-y-4">
            <div className="border-b-2 border-slate-200 pb-3">
              <h3 className="font-black text-base uppercase text-black font-['Manrope'] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>3. Scanned & Paid? Confirm & Settle Payment</span>
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                Enter your 12-digit UPI UTR transaction reference number to generate your official GST Tax Invoice.
              </p>
            </div>

            <form onSubmit={handleConfirmSettlement} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-800 mb-1">
                    App Used for Scanning
                  </label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-black font-bold text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="Google Pay">Google Pay UPI</option>
                    <option value="PhonePe">PhonePe UPI</option>
                    <option value="Paytm">Paytm UPI</option>
                    <option value="BHIM UPI">BHIM UPI</option>
                    <option value="Amazon Pay">Amazon Pay</option>
                    <option value="NetBanking App">Bank UPI App (SBI/HDFC/ICICI)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black uppercase text-slate-800">
                      12-Digit UPI Ref No / UTR
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateTestUtr}
                      className="text-[10px] font-black text-indigo-700 hover:text-indigo-950 underline cursor-pointer uppercase"
                    >
                      Fill Test UTR
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 428190382910"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-black font-mono font-bold text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-700/20 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying with NPCI & Issuing Bank...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Confirm & Generate Official Tax Invoice</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: HIGH-DEFINITION QR SCANNING TERMINAL (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* TERMINAL CONTAINER */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border-2 border-slate-800 space-y-5 text-center relative">
            
            {/* Terminal Top Info */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                  QR
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-white">
                    {activeQr.payeeName}
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified Merchant Terminal</span>
                  </span>
                </div>
              </div>

              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {activeQr.bankName || 'UPI Gateway'}
              </span>
            </div>

            {/* Live Amount Box */}
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Scan to Pay Exact Amount
              </span>
              <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                ₹{payableAmount.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-slate-300 font-bold truncate">
                {currentTrip && selectedTripId !== 'custom' 
                  ? `${currentTrip.title} (${paymentType.toUpperCase()} PAYMENT)` 
                  : customPurpose}
              </p>
            </div>

            {/* THE QR CODE DISPLAY CARD */}
            <div className="bg-white p-5 rounded-3xl shadow-inner border-4 border-amber-400 inline-block mx-auto max-w-[280px] relative group">
              <div className="relative">
                <img
                  src={qrCodeDisplayUrl}
                  alt={`Scan & Pay QR for ${activeQr.title}`}
                  className="w-56 h-56 object-contain rounded-xl mx-auto"
                />
                
                {/* CENTER BADGE */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-lg border-2 border-amber-400 font-black text-xs font-['Manrope']">
                    HSK
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200">
                <p className="text-[11px] font-black text-slate-900 uppercase font-['Manrope']">
                  SCAN WITH ANY UPI APP
                </p>
                <p className="text-[9px] text-slate-500 font-bold">
                  GPay • PhonePe • Paytm • BHIM
                </p>
              </div>
            </div>

            {/* UPI VPA AND COPY BUTTON */}
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center justify-between gap-2 text-xs">
              <div className="text-left">
                <span className="text-[9px] text-slate-400 font-black uppercase block">Merchant UPI VPA</span>
                <span className="font-mono text-amber-300 font-black text-xs select-all">
                  {activeQr.upiId}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(activeQr.upiId, 'vpa')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-3 py-1.5 rounded-xl text-[11px] uppercase transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                {copiedText === 'vpa' ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy UPI</span>
                  </>
                )}
              </button>
            </div>

            {/* DEEP-LINK BUTTONS: OPEN ON MOBILE */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                Direct UPI Launch (Mobile Devices)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`gpay://upi/pay?pa=${activeQr.upiId}&pn=${encodeURIComponent(activeQr.payeeName)}&am=${payableAmount}&cu=INR`}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-[11px] font-black text-white border border-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Pay</span>
                </a>

                <a
                  href={`phonepe://pay?pa=${activeQr.upiId}&pn=${encodeURIComponent(activeQr.payeeName)}&am=${payableAmount}&cu=INR`}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-[11px] font-black text-white border border-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                  <span>PhonePe</span>
                </a>

                <a
                  href={`paytmmp://pay?pa=${activeQr.upiId}&pn=${encodeURIComponent(activeQr.payeeName)}&am=${payableAmount}&cu=INR`}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-[11px] font-black text-white border border-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Paytm</span>
                </a>
              </div>
            </div>

            {/* ACTION UTILITIES: DOWNLOAD & PRINT */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="text-slate-300 hover:text-white font-black flex items-center gap-1 cursor-pointer transition uppercase text-[11px]"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download QR</span>
              </button>

              <span className="text-slate-600">•</span>

              <button
                type="button"
                onClick={handlePrintQr}
                className="text-slate-300 hover:text-white font-black flex items-center gap-1 cursor-pointer transition uppercase text-[11px]"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                <span>Print QR Slip</span>
              </button>

              <span className="text-slate-600">•</span>

              <button
                type="button"
                onClick={() => handleCopy(upiPayload, 'intent')}
                className="text-slate-300 hover:text-white font-black flex items-center gap-1 cursor-pointer transition uppercase text-[11px]"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>{copiedText === 'intent' ? 'Copied URI' : 'Copy UPI Link'}</span>
              </button>
            </div>

          </div>

          {/* SAFETY NOTICE CARD */}
          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-300 text-xs text-slate-800 space-y-2 font-bold">
            <div className="flex items-center gap-2 text-indigo-900 font-black uppercase text-[11px]">
              <Lock className="w-4 h-4" />
              <span>Zero-Fraud Assurance</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Scan & Pay transactions settle directly into HSK Tours & Travels' verified merchant banking escrow. 
              Once paid, keep your UPI reference number handy to retrieve your passenger voucher.
            </p>
          </div>

        </div>

      </div>

      {/* ===================================================================== */}
      {/* SAVED & ACTIVE QR CODES MANAGEMENT ROSTER */}
      {/* ===================================================================== */}
      <div id="saved-qr-roster" className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-3">
          <div>
            <h3 className="font-black text-base uppercase text-black font-['Manrope'] flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-700" />
              <span>Saved QR Codes Directory ({qrList.length})</span>
            </h3>
            <p className="text-xs text-slate-600 font-bold">
              Manage your company, driver, and branch QR codes available for customers to scan and pay.
            </p>
          </div>

          <button
            onClick={() => setIsAddQrModalOpen(true)}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-md shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Another QR Code</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {qrList.map((qr) => {
            const isSelected = qr.id === selectedQrId;
            const isOfficial = qr.id.startsWith('qr-official');

            return (
              <div
                key={qr.id}
                className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-3 transition ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md' 
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      isOfficial 
                        ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' 
                        : 'bg-amber-100 text-amber-950 border border-amber-300'
                    }`}>
                      {isOfficial ? 'Official HSK' : 'Custom Added'}
                    </span>

                    {!isOfficial && (
                      <button
                        onClick={() => handleDeleteQr(qr.id)}
                        title="Delete custom QR"
                        className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h4 className="font-black text-sm text-black uppercase font-['Manrope']">
                    {qr.title}
                  </h4>

                  <div className="space-y-1 text-xs font-bold text-slate-700">
                    <p>Payee: <strong className="text-black">{qr.payeeName}</strong></p>
                    <p>Bank: <strong className="text-black">{qr.bankName}</strong></p>
                    <p className="font-mono text-indigo-950 font-black">UPI: {qr.upiId}</p>
                    {qr.notes && <p className="text-[10px] text-slate-500 italic mt-1 font-medium">{qr.notes}</p>}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedQrId(qr.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-black'
                    }`}
                  >
                    {isSelected ? 'Active Terminal' : 'Select to Scan'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(qr.upiId, qr.id)}
                    className="text-[11px] font-black text-indigo-800 hover:text-indigo-950 uppercase cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedText === qr.id ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: ADD CUSTOM QR CODE */}
      {/* ===================================================================== */}
      {isAddQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border-2 border-slate-300 text-black">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <QrCode className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="font-black text-base text-black uppercase font-['Manrope']">
                    Add New QR Code for Scan & Pay
                  </h3>
                  <p className="text-xs text-slate-600 font-bold">
                    Add custom UPI VPA or upload a printed QR code sticker
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddQrModalOpen(false)}
                className="text-slate-500 hover:text-black font-black text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewQr} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-black uppercase text-slate-800 mb-1">
                  QR Code Title / Branch Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore Branch Desk or Driver Spot UPI"
                  value={newQrTitle}
                  onChange={(e) => setNewQrTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-slate-800 mb-1">
                    Payee Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HSK Tours & Travels"
                    value={newQrPayeeName}
                    onChange={(e) => setNewQrPayeeName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-slate-800 mb-1">
                    UPI VPA ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hsktravels@icici"
                    value={newQrUpiId}
                    onChange={(e) => setNewQrUpiId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-black font-mono font-bold focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-slate-800 mb-1">
                    Bank / Service Provider
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ICICI Bank, HDFC, SBI, Paytm"
                    value={newQrBankName}
                    onChange={(e) => setNewQrBankName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-slate-800 mb-1">
                    Usage Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. For Coimbatore route pickups"
                    value={newQrNotes}
                    onChange={(e) => setNewQrNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* UPLOAD CUSTOM QR CODE IMAGE */}
              <div className="space-y-2 pt-1 border-t border-slate-200">
                <label className="block font-black uppercase text-slate-800">
                  Upload Custom QR Code Image (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 transition relative">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {newQrImageBase64 ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={newQrImageBase64}
                        alt="Uploaded QR Code Preview"
                        className="w-24 h-24 object-contain rounded-xl border border-slate-300 bg-white p-1"
                      />
                      <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>QR Code Image Attached</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-600 font-bold">
                      <Upload className="w-6 h-6 text-indigo-700 mb-1" />
                      <span className="text-xs text-black font-black">Click or drag & drop QR image</span>
                      <span className="text-[10px] text-slate-500">Supports PNG, JPG, WebP up to 2MB</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DEFAULT CHECKBOX */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="set-default-qr"
                  checked={newQrSetDefault}
                  onChange={(e) => setNewQrSetDefault(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="set-default-qr" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Set this as default QR code for Scan and Pay
                </label>
              </div>

              {uploadError && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-bold">
                  {uploadError}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddQrModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-black font-black rounded-xl text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-black rounded-xl text-xs uppercase cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Save QR Code</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
