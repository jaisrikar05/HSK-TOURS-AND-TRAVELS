import React, { useState } from 'react';
import { TourPackage, ViewMode, Vehicle, PlannedTrip, TripFeedback } from '../types';
import { Wifi, Volume2, Armchair, Snowflake, Send, ArrowRight, CheckCircle2, Sparkles, MapPin, Bus, Camera, Image as ImageIcon } from 'lucide-react';
import { RealLifeImageGeneratorModal } from './RealLifeImageGeneratorModal';

interface PublicHomeProps {
  packages: TourPackage[];
  vehicles?: Vehicle[];
  plannedTrips?: PlannedTrip[];
  feedbackList?: TripFeedback[];
  onSelectPackage: (pkg: TourPackage) => void;
  onNavigate: (view: ViewMode) => void;
  onUpdatePackageCover?: (packageId: string, imageUrl: string, imageSize: '1K' | '2K' | '4K') => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  packages,
  vehicles,
  plannedTrips,
  feedbackList,
  onSelectPackage,
  onNavigate,
  onUpdatePackageCover,
}) => {
  const [heroPrompt, setHeroPrompt] = useState('');
  const [selectedGeneratorPkg, setSelectedGeneratorPkg] = useState<TourPackage | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  
  // Interactive Live Chat Widget state for Landing Page
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'assistant' | 'user';
    text: string;
    sources?: Array<{ title: string; uri: string }>;
    mapPlaces?: Array<{ title: string; uri: string; address?: string; snippet?: string }>;
  }>>([
    {
      sender: 'assistant',
      text: 'Hello! I am **HSK AI Assistant**. Ask me about live bus availability, Google Maps locations, route analysis, weather, or custom trip estimates for any city across India or worldwide.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSendChat = async (msgToSend?: string) => {
    const text = msgToSend || inputMessage;
    if (!text.trim()) return;

    // Append user message
    setChatMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputMessage('');
    setIsAiLoading(true);

    const historyPayload = chatMessages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text,
    }));

    const sanitizedVehicles = vehicles?.map(({ image, ...rest }) => rest);
    const sanitizedPackages = packages?.map(({ image, ...rest }) => rest);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: historyPayload,
          vehicles: sanitizedVehicles,
          packages: sanitizedPackages,
          plannedTrips,
          feedbackList,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: data.text || 'I am ready to assist with your journey!',
          sources: data.sources,
          mapPlaces: data.mapPlaces,
        }
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Here is the real-time info for "${text}". You can also use our AI Planner to build day-by-day itineraries.`
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroPrompt.trim()) {
      onNavigate('ai-planner');
    } else {
      onNavigate('ai-planner');
    }
  };

  return (
    <div className="text-slate-900 min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[620px] lg:min-h-[700px] flex items-center justify-center overflow-hidden py-20 bg-gradient-to-br from-indigo-50 via-slate-50 to-rose-50">
        {/* Background Bus Highway Image with Frosted Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-slate-50/80 to-indigo-50/90 backdrop-blur-xs" />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 w-full z-10">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight font-['Manrope'] leading-[1.1] text-black">
              YOUR JOURNEY,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-700 via-indigo-800 to-cyan-800">
                REIMAGINED
              </span>
            </h1>

            <p className="text-base sm:text-xl text-black font-['Inter'] leading-relaxed max-w-xl font-bold">
              Experience premium corporate travel and bespoke holiday planning. Reliability meets modern convenience in every mile.
            </p>

            {/* AI Prompt Search Bar */}
            <form onSubmit={handleHeroSubmit} className="pt-4">
              <div className="bg-white p-2.5 rounded-2xl sm:rounded-full shadow-xl border-2 border-slate-300 flex flex-col sm:flex-row items-center gap-2 max-w-2xl">
                <div className="flex items-center gap-3 px-4 py-2 w-full text-black">
                  <MapPin className="w-5 h-5 text-rose-600 shrink-0" />
                  <input
                    type="text"
                    value={heroPrompt}
                    onChange={(e) => setHeroPrompt(e.target.value)}
                    placeholder="Where do you want to go? Try 'Plan a 3-day trip to...'"
                    className="w-full bg-transparent border-none text-black placeholder:text-slate-600 text-sm sm:text-base font-bold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-indigo-700 hover:from-rose-500 hover:to-indigo-600 text-white font-extrabold px-6 py-3.5 rounded-xl sm:rounded-full text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shrink-0 transition cursor-pointer shadow-md shadow-rose-600/30 border border-transparent"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
                  <span>PLAN WITH AI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FEATURED TOUR PACKAGES SECTION */}
      <section className="py-20 max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-black font-['Manrope'] tracking-tight uppercase">
              FEATURED TOUR PACKAGES
            </h2>
            <p className="text-black font-['Inter'] text-sm sm:text-base mt-2 font-bold">
              Handpicked journeys curated for your comfort and memory.
            </p>
          </div>

          <button
            onClick={() => onNavigate('packages')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-indigo-900 hover:text-indigo-700 tracking-wider uppercase transition cursor-pointer group"
          >
            <span>VIEW ALL PACKAGES</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-rose-600" />
          </button>
        </div>

        {/* Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.slice(0, 3).map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl overflow-hidden hover:border-indigo-400 transition-all duration-300 flex flex-col group hover:-translate-y-1 shadow-lg border-2 border-slate-300"
            >
              {/* Card Image Header with Price Badge */}
              <div className="relative h-60 overflow-hidden bg-slate-100">
                <img
                  src={pkg.image}
                  alt={pkg.subtitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* AI Real-Life Cover Generator Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGeneratorPkg(pkg);
                    setIsGeneratorOpen(true);
                  }}
                  className="absolute top-4 left-4 bg-slate-900/90 hover:bg-black text-amber-300 hover:text-white px-2.5 py-1 rounded-full shadow-lg text-[10px] font-black border border-amber-400/40 flex items-center gap-1 backdrop-blur-md cursor-pointer transition"
                  title="Generate photorealistic 1K/2K/4K cover image using gemini-3.1-flash-image"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>AI Cover ({pkg.imageSize || '2K'})</span>
                </button>

                <div className="absolute top-4 right-4 bg-indigo-800 text-white px-3.5 py-1.5 rounded-full shadow-md text-xs font-black border border-indigo-700">
                  ₹{(pkg.pricePerPerson / 1000).toFixed(2)}k
                </div>
                <div className="absolute bottom-3 left-4 bg-white text-slate-900 text-[11px] font-black px-3 py-1 rounded-full border border-slate-300 shadow-md flex items-center gap-1.5">
                  <span>⏱ {pkg.duration}</span>
                  {pkg.imageSize && (
                    <span className="text-[9px] bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      {pkg.imageSize}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-black text-black font-['Manrope'] leading-tight">
                    {pkg.title} <span className="text-rose-700">{pkg.subtitle}</span>
                  </h3>
                  <p className="text-slate-900 text-xs sm:text-sm mt-2 font-['Inter'] line-clamp-2 leading-relaxed font-bold">
                    {pkg.description}
                  </p>

                  {/* Highlights Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {pkg.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="bg-indigo-100 text-indigo-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-indigo-200 tracking-wider"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectPackage(pkg)}
                  className="w-full mt-4 py-3 border-2 border-indigo-700 text-indigo-900 hover:bg-indigo-700 hover:text-white font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer text-center bg-indigo-50 shadow-sm hover:border-indigo-700"
                >
                  VIEW DETAILS
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTELLIGENT TRAVEL ASSISTANT SECTION */}
      <section className="py-20 relative overflow-hidden bg-slate-100/80 border-y-2 border-slate-300">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-rose-100 px-3.5 py-1 rounded-full text-[10px] font-black uppercase text-rose-900 tracking-widest border border-rose-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI POWERED</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-['Manrope'] tracking-tight uppercase leading-tight text-black">
              INTELLIGENT TRAVEL ASSISTANT
            </h2>

            <p className="text-slate-900 text-sm sm:text-base font-['Inter'] leading-relaxed font-bold">
              Chat with our AI to instantly plan complex itineraries, verify vehicle status, and receive real-time cost estimates. It's like having a travel expert in your pocket 24/7.
            </p>

            <div className="space-y-3 pt-2 text-sm sm:text-base font-bold">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-800 shrink-0" />
                <span className="text-black font-bold">Verified Fleet Availability & Schedules</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-800 shrink-0" />
                <span className="text-black font-bold">Personalized Multi-City Route Suggestions</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-800 shrink-0" />
                <span className="text-black font-bold">Instant Price Transparency</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => onNavigate('ai-planner')}
                className="bg-gradient-to-r from-rose-700 to-indigo-700 hover:from-rose-600 hover:to-indigo-600 text-white font-black px-6 py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <span>START CHATTING</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Right Live Assistant Chat Widget */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200 text-slate-900 max-w-md mx-auto">
              {/* Widget Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bus className="w-5 h-5 text-cyan-200" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">HSK AI ASSISTANT</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Online & Ready</span>
                  </div>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="py-4 space-y-3 h-[280px] overflow-y-auto pr-1 text-xs sm:text-sm">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white rounded-br-none shadow-sm'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200 shadow-xs'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <p>{msg.text}</p>
                      ) : (
                        <div className="space-y-1">
                          {msg.text.split('\n').map((line, lIdx) => {
                            if (!line.trim()) return <div key={lIdx} className="h-1" />;
                            if (line.startsWith('###')) {
                              return (
                                <h5 key={lIdx} className="font-extrabold text-indigo-700 text-xs mt-1">
                                  {line.replace(/^###\s*/, '')}
                                </h5>
                              );
                            }
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            const formattedLine = parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                              }
                              return part;
                            });

                            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                              return (
                                <div key={lIdx} className="flex items-start gap-1.5 pl-1">
                                  <span className="text-rose-600 font-bold shrink-0">•</span>
                                  <span>{formattedLine}</span>
                                </div>
                              );
                            }
                            return <p key={lIdx}>{formattedLine}</p>;
                          })}
                        </div>
                      )}
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-w-[88%]">
                        {msg.sources.slice(0, 2).map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-indigo-50 text-[10px] text-indigo-700 hover:text-indigo-900 px-2 py-0.5 rounded border border-indigo-200 truncate max-w-[160px]"
                            title={src.title}
                          >
                            🌐 {src.title}
                          </a>
                        ))}
                      </div>
                    )}

                    {msg.mapPlaces && msg.mapPlaces.length > 0 && (
                      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 max-w-[88%] text-slate-900 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-emerald-900 border-b border-emerald-200 pb-1">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-600" /> Google Maps Data</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-mono">MAPS GROUNDED</span>
                        </div>
                        {msg.mapPlaces.map((place, pIdx) => (
                          <div key={pIdx} className="bg-white p-1.5 rounded-lg border border-emerald-200 flex items-center justify-between text-[11px]">
                            <span className="font-extrabold text-slate-900 truncate">📍 {place.title}</span>
                            <a href={place.uri} target="_blank" rel="noreferrer" className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase hover:bg-emerald-700 shrink-0 ml-1">Map Link</a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-amber-50 text-amber-800 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs flex items-center gap-2 border border-amber-200">
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>Analyzing real-time travel data...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Quick Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 pt-1 text-[11px] no-scrollbar">
                <button
                  type="button"
                  onClick={() => handleSendChat('What is the live weather and temperature in Coimbatore?')}
                  className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold px-3 py-1 rounded-full whitespace-nowrap cursor-pointer border border-cyan-200 transition"
                >
                  🌡️ Coimbatore Weather
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat('What is the climate in Trichy right now?')}
                  className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold px-3 py-1 rounded-full whitespace-nowrap cursor-pointer border border-cyan-200 transition"
                >
                  🌦️ Trichy Climate
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat('What is the live weather in Tirupati?')}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full whitespace-nowrap cursor-pointer border border-amber-200 transition"
                >
                  ☀️ Tirupati Weather
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat('Which vehicles are available right now?')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full whitespace-nowrap cursor-pointer border border-emerald-200 transition"
                >
                  🚌 Available Vehicles?
                </button>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2 pt-2 border-t border-slate-200"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your request..."
                  className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="bg-rose-600 hover:bg-rose-500 text-white p-2.5 rounded-xl transition cursor-pointer shrink-0 disabled:opacity-50 border border-transparent"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* OUR PREMIUM FLEET SECTION */}
      <section className="py-20 max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-4xl font-black text-black font-['Manrope'] uppercase tracking-tight">
            OUR PREMIUM FLEET
          </h2>
          <p className="text-black font-['Inter'] text-sm sm:text-base mt-2 font-bold">
            Travel in ultimate comfort with our fleet of modern coaches, designed for corporate groups and family tours.
          </p>
        </div>

        {/* 4 Feature Icon Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl text-center space-y-3 hover:border-indigo-400 transition border-2 border-slate-300 shadow-md">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-800 mx-auto flex items-center justify-center border border-indigo-200">
              <Wifi className="w-6 h-6" />
            </div>
            <h4 className="font-black text-black text-sm font-['Manrope'] uppercase">
              HIGH-SPEED WI-FI
            </h4>
            <p className="text-xs text-slate-900 font-['Inter'] font-bold">
              Stay connected throughout your journey.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl text-center space-y-3 hover:border-indigo-400 transition border-2 border-slate-300 shadow-md">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-800 mx-auto flex items-center justify-center border border-indigo-200">
              <Volume2 className="w-6 h-6" />
            </div>
            <h4 className="font-black text-black text-sm font-['Manrope'] uppercase">
              PREMIUM AUDIO
            </h4>
            <p className="text-xs text-slate-900 font-['Inter'] font-bold">
              Surround sound for movies and music.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl text-center space-y-3 hover:border-indigo-400 transition border-2 border-slate-300 shadow-md">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-800 mx-auto flex items-center justify-center border border-indigo-200">
              <Armchair className="w-6 h-6" />
            </div>
            <h4 className="font-black text-black text-sm font-['Manrope'] uppercase">
              COMFORT SEATING
            </h4>
            <p className="text-xs text-slate-900 font-['Inter'] font-bold">
              Ergonomic recliners with extra legroom.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl text-center space-y-3 hover:border-indigo-400 transition border-2 border-slate-300 shadow-md">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-800 mx-auto flex items-center justify-center border border-indigo-200">
              <Snowflake className="w-6 h-6" />
            </div>
            <h4 className="font-black text-black text-sm font-['Manrope'] uppercase">
              CLIMATE CONTROL
            </h4>
            <p className="text-xs text-slate-900 font-['Inter'] font-bold">
              Multi-zone AC for perfect temperature.
            </p>
          </div>
        </div>

        {/* Fleet Showcase Grid */}
        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-3xl overflow-hidden border-2 border-slate-300 shadow-lg hover:border-indigo-400 transition-all flex flex-col justify-between group"
              >
                <div className="relative h-56 bg-slate-100 overflow-hidden">
                  <img
                    src={v.image || 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800'}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/90 text-white font-mono text-[11px] font-black px-3 py-1 rounded-full border border-slate-700 shadow-md">
                    {v.regNumber}
                  </div>
                  <div className={`absolute top-4 right-4 text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-md border ${
                    v.status === 'AVAILABLE' ? 'bg-emerald-600 text-white border-emerald-500' :
                    v.status === 'ON TRIP' ? 'bg-amber-500 text-slate-950 border-amber-400' :
                    v.status === 'MAINTENANCE' ? 'bg-rose-600 text-white border-rose-500' :
                    'bg-slate-700 text-white border-slate-600'
                  }`}>
                    {v.status}
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-indigo-100 text-indigo-950 font-black px-2.5 py-1 rounded-md uppercase tracking-wider border border-indigo-200">
                        {v.category || 'Bus'} • {v.capacity}
                      </span>
                      <span className="text-sm font-black text-rose-700 font-['Manrope']">
                        ₹{(v.pricePerDay || 0).toLocaleString('en-IN')}/day
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-black font-['Manrope']">
                      {v.name}
                    </h3>

                    <p className="text-xs text-slate-700 font-bold flex items-center gap-1">
                      <span>📍 Base Location:</span>
                      <strong className="text-slate-900">{v.location || 'Coimbatore Depot'}</strong>
                    </p>

                    {v.currentDriver && (
                      <p className="text-xs text-slate-700 font-bold flex items-center gap-1">
                        <span>👤 Driver:</span>
                        <strong className="text-slate-900">{v.currentDriver}</strong>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="w-full mt-2 py-3 bg-indigo-50 hover:bg-indigo-700 text-indigo-900 hover:text-white border-2 border-indigo-700 font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer text-center"
                  >
                    Check & Reserve Vehicle
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-4 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-800 mx-auto flex items-center justify-center font-black border border-indigo-200">
              <Bus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 font-['Manrope']">
              No Vehicles Currently in Fleet
            </h3>
            <p className="text-xs text-slate-600 font-bold max-w-md mx-auto leading-relaxed">
              You have not added any vehicles yet. All default vehicles have been cleared. Add your custom vehicles in the Admin Panel to display them here across the application.
            </p>
            <button
              onClick={() => onNavigate('admin')}
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <span>+ Add Vehicle in Fleet Control</span>
            </button>
          </div>
        )}
      </section>

      {/* Real-Life AI Cover Photo Generator Modal */}
      <RealLifeImageGeneratorModal
        isOpen={isGeneratorOpen}
        packageItem={selectedGeneratorPkg}
        onClose={() => {
          setIsGeneratorOpen(false);
          setSelectedGeneratorPkg(null);
        }}
        onApplyImage={(newUrl, size, pkgId) => {
          if (onUpdatePackageCover && pkgId) {
            onUpdatePackageCover(pkgId, newUrl, size);
          }
        }}
      />
    </div>
  );
};
