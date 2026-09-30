import React, { useState } from 'react';
import { TourPackage } from '../types';
import { CheckCircle2, Clock, MapPin, Users, Calendar, Bus, X, Sparkles, Camera } from 'lucide-react';
import { RealLifeImageGeneratorModal } from './RealLifeImageGeneratorModal';

interface PackageDetailModalProps {
  pkg: TourPackage | null;
  onClose: () => void;
  onConfirmBooking: (bookingDetails: {
    packageName: string;
    guests: number;
    travelDate: string;
    preferredBus: string;
    contactName: string;
    contactPhone: string;
  }) => void;
  onUpdatePackageCover?: (packageId: string, imageUrl: string, imageSize: '1K' | '2K' | '4K') => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  pkg,
  onClose,
  onConfirmBooking,
  onUpdatePackageCover,
}) => {
  const [guests, setGuests] = useState(2);
  const [travelDate, setTravelDate] = useState('2026-08-15');
  const [preferredBus, setPreferredBus] = useState('Luxury Force Traveler (12+1)');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [currentCoverImage, setCurrentCoverImage] = useState(pkg?.image || '');
  const [currentSize, setCurrentSize] = useState<'1K' | '2K' | '4K' | undefined>(pkg?.imageSize || '2K');

  React.useEffect(() => {
    if (pkg) {
      setCurrentCoverImage(pkg.image);
      setCurrentSize(pkg.imageSize || '2K');
    }
  }, [pkg]);

  if (!pkg) return null;

  const totalPrice = pkg.pricePerPerson * guests;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;

    onConfirmBooking({
      packageName: `${pkg.title} ${pkg.subtitle}`,
      guests,
      travelDate,
      preferredBus,
      contactName,
      contactPhone,
    });

    setBookedSuccess(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
        <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-300 my-8 text-black">
          {/* Modal Header Banner */}
          <div className="relative h-60 bg-slate-900 group">
            <img
              src={currentCoverImage}
              alt={pkg.subtitle}
              className="w-full h-full object-cover opacity-90 transition duration-300"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer border border-white/20 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* AI Image Generation Trigger Badge */}
            <button
              type="button"
              onClick={() => setIsGeneratorOpen(true)}
              className="absolute top-4 left-4 bg-slate-900/90 hover:bg-black text-amber-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-black transition cursor-pointer border border-amber-400/40 flex items-center gap-1.5 shadow-lg backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Real-Life AI Cover ({currentSize || '2K'})</span>
            </button>

            <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-rose-700 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-white/20">
                  {pkg.duration}
                </span>
                {currentSize && (
                  <span className="bg-black/60 text-amber-300 font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-amber-400/30">
                    {currentSize} Resolution
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-['Manrope'] drop-shadow-md">
                {pkg.title} <span className="text-amber-300">{pkg.subtitle}</span>
              </h2>
              <p className="text-xs text-white flex items-center gap-1 font-bold drop-shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{pkg.location}</span>
              </p>
            </div>
          </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-black">
          {!bookedSuccess ? (
            <>
              {/* Description */}
              <div>
                <h4 className="font-black text-sm text-indigo-900 uppercase tracking-wider mb-2 font-['Manrope']">
                  Trip Summary
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-['Inter'] font-bold">
                  {pkg.description}
                </p>
              </div>

              {/* Day-by-Day Itinerary */}
              <div>
                <h4 className="font-black text-sm text-indigo-900 uppercase tracking-wider mb-3 font-['Manrope']">
                  Day-by-Day Experience
                </h4>
                <div className="space-y-3">
                  {pkg.itinerary.map((item) => (
                    <div key={item.day} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-700 text-white text-[10px] font-black px-2 py-0.5 rounded">
                          Day {item.day}
                        </span>
                        <h5 className="font-black text-xs text-black">{item.title}</h5>
                      </div>
                      <p className="text-xs text-slate-800 font-['Inter'] leading-relaxed pl-1 font-bold">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions */}
              <div>
                <h4 className="font-black text-sm text-indigo-900 uppercase tracking-wider mb-2 font-['Manrope']">
                  Included Amenities & Perks
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {pkg.includedAmenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-900 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleSubmit} className="pt-4 border-t-2 border-slate-200 space-y-4">
                <h4 className="font-black text-sm text-indigo-950 uppercase tracking-wider font-['Manrope']">
                  Reserve This Tour Package
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Number of Passengers</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-800 mb-1">Departure Date</label>
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-800 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-800 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-black font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-100 p-4 rounded-2xl flex items-center justify-between border border-slate-300">
                  <div>
                    <span className="text-xs text-slate-800 font-black block">TOTAL ESTIMATED FARE</span>
                    <span className="text-2xl font-black text-rose-700 font-['Manrope']">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-black text-black font-['Manrope']">
                Booking Request Received!
              </h3>

              <p className="text-xs sm:text-sm text-slate-800 max-w-md mx-auto leading-relaxed font-bold">
                Thank you, <strong>{contactName}</strong>. Your reservation request for <strong>{pkg.title} {pkg.subtitle}</strong> for {guests} passengers on {travelDate} has been registered. Ref: <span className="font-mono text-rose-700 font-black">HSK-{Math.floor(100000 + Math.random() * 900000)}</span>.
              </p>

              <button
                onClick={onClose}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-black px-8 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Close & Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Real-Life AI Cover Photo Generator Modal */}
    <RealLifeImageGeneratorModal
      isOpen={isGeneratorOpen}
      packageItem={pkg}
      onClose={() => setIsGeneratorOpen(false)}
      onApplyImage={(newUrl, size) => {
        setCurrentCoverImage(newUrl);
        setCurrentSize(size);
        if (onUpdatePackageCover && pkg) {
          onUpdatePackageCover(pkg.id, newUrl, size);
        }
      }}
    />
    </>
  );
};
