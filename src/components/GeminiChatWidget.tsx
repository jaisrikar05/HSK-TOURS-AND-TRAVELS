import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Trash2, Bot, User, MapPin, ExternalLink, RefreshCw, ChevronDown, Navigation, Thermometer, Wind, Droplets, CloudSun } from 'lucide-react';
import { Vehicle, TourPackage, PlannedTrip, TripFeedback } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  weatherData?: {
    cityName: string;
    temperature: string;
    feelsLike: string;
    condition: string;
    icon: string;
    humidity: string;
    windSpeed: string;
    rainProb: string;
    tempMax: string;
    tempMin: string;
    travelAdvice: string;
    updatedAt: string;
  };
  card?: {
    title: string;
    days: string[];
    recommendedVehicle: string;
    estPrice: string;
    origin?: string;
    destination?: string;
  };
  routeData?: {
    origin: string;
    destination: string;
    distance?: string;
    duration?: string;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
  };
  sources?: Array<{ title: string; uri: string }>;
  mapPlaces?: Array<{ title: string; uri: string; address?: string; snippet?: string }>;
}

interface GeminiChatWidgetProps {
  vehicles?: Vehicle[];
  packages?: TourPackage[];
  plannedTrips?: PlannedTrip[];
  feedbackList?: TripFeedback[];
}

export const GeminiChatWidget: React.FC<GeminiChatWidgetProps> = ({
  vehicles,
  packages,
  plannedTrips,
  feedbackList,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [weatherSearchCity, setWeatherSearchCity] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am **HSK Gemini AI Assistant**, your 24/7 intelligent travel concierge and fleet advisor.

I can help you with:
• **Real-Time Live Weather for ANY City Globally** (Try typing "Weather in Coimbatore", "Trichy temperature", "Tirupati climate", or search ANY city below!)
• **Route Analysis & Highway Travel Guidance** (Distances, road conditions, toll advice)
• **Custom Day-by-Day Tour Itineraries** (Ooty, Manali, Goa, Jaipur, Kashmir, Kerala, Paris...)
• **Fleet Status & Vehicle Rates** (Real-Time Synced Active Fleet)

What destination or city weather would you like to check today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [isOpen, messages]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isGenerating) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsGenerating(true);

    // Get user geolocation if available for Maps Grounding
    let userLat: number | null = null;
    let userLng: number | null = null;

    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 3000 });
        });
        if (pos) {
          userLat = pos.coords.latitude;
          userLng = pos.coords.longitude;
        }
      } catch {
        // Geolocation denied or unavailable
      }
    }

    // Build multi-turn history payload
    const historyPayload = messages
      .filter((m) => m.id !== 'welcome-1') // omit heavy default welcome
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text || (m.card ? `${m.card.title}: ${m.card.days.join(', ')}` : ''),
      }));

    // Sanitize heavy base64 images from vehicles and packages before sending payload
    const sanitizedVehicles = vehicles?.map(({ image, ...rest }) => rest);
    const sanitizedPackages = packages?.map(({ image, ...rest }) => rest);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: historyPayload,
          vehicles: sanitizedVehicles,
          packages: sanitizedPackages,
          plannedTrips,
          feedbackList,
          lat: userLat,
          lng: userLng,
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'I am ready to help you plan your journey with HSK Tours & Travels!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        weatherData: data.weatherData,
        card: data.card,
        routeData: data.routeData,
        sources: data.sources,
        mapPlaces: data.mapPlaces,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: `I have received your request regarding "${textToSend}". Our luxury force travelers and Volvo coaches are available. You can also connect with our 24/7 travel desk at +91 98450 12345.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. What new destination or travel query would you like to analyze with Gemini AI?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-[400px] h-[550px] max-h-[80vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-900 p-4 border-b border-slate-800 flex items-center justify-between shrink-0 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 font-['Manrope']">
                  <span>HSK Gemini AI Concierge</span>
                  <span className="text-[9px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-1.5 py-0.5 rounded-full font-mono">
                    3.6 Flash
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Online • Multi-turn Real-Time AI</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="text-slate-300 hover:text-rose-300 p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Universal Live Weather Search Bar */}
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (weatherSearchCity.trim()) {
                  handleSend(`What is the live weather and temperature in ${weatherSearchCity.trim()}?`);
                  setWeatherSearchCity('');
                }
              }}
              className="flex items-center gap-1.5"
            >
              <div className="relative flex-1">
                <CloudSun className="w-3.5 h-3.5 text-cyan-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={weatherSearchCity}
                  onChange={(e) => setWeatherSearchCity(e.target.value)}
                  placeholder="Check live weather for ANY city (e.g. Coimbatore, Trichy, Salem)..."
                  className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-[11px] pl-8 pr-2 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:border-cyan-600"
                />
              </div>
              <button
                type="submit"
                disabled={!weatherSearchCity.trim() || isGenerating}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-xl cursor-pointer shrink-0 transition flex items-center gap-1 shadow-xs"
              >
                <span>Check</span>
              </button>
            </form>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1">
                  {msg.sender === 'assistant' ? (
                    <span className="flex items-center gap-1 font-bold text-amber-700">
                      <Bot className="w-3 h-3" /> HSK Gemini AI
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-bold text-indigo-700">
                      <User className="w-3 h-3" /> You
                    </span>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white rounded-tr-none shadow-md'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
                  }`}
                >
                  {/* Markdown formatted output */}
                  {msg.sender === 'user' ? (
                    <p className="font-medium">{msg.text}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {msg.text.split('\n').map((line, lIdx) => {
                        if (!line.trim()) return <div key={lIdx} className="h-1" />;
                        if (line.startsWith('###')) {
                          return (
                            <h5 key={lIdx} className="font-extrabold text-indigo-800 text-xs mt-1 border-b border-slate-200 pb-0.5">
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

                {/* Grounding Web Citations if present */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-w-[90%] pl-1">
                    {msg.sources.slice(0, 3).map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-indigo-50 text-[10px] text-indigo-700 hover:text-indigo-900 px-2 py-0.5 rounded border border-indigo-200 truncate max-w-[180px] flex items-center gap-1"
                        title={src.title}
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{src.title}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Real-Time Live Weather Card */}
                {msg.weatherData && (
                  <div className="border border-cyan-200 rounded-2xl p-3.5 max-w-[92%] space-y-2.5 text-slate-900 shadow-md bg-gradient-to-br from-cyan-50 via-slate-50 to-indigo-50">
                    <div className="flex items-center justify-between border-b border-cyan-200/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <CloudSun className="w-4 h-4 text-cyan-600 animate-pulse" />
                        <h4 className="font-extrabold text-xs text-slate-900 font-['Manrope']">
                          {msg.weatherData.cityName}
                        </h4>
                      </div>
                      <span className="text-[9px] bg-cyan-100 text-cyan-800 font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-ping"></span>
                        LIVE METEOROLOGICAL DATA
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{msg.weatherData.icon}</span>
                        <div>
                          <div className="text-xl font-black text-slate-900 font-mono leading-none">
                            {msg.weatherData.temperature}
                          </div>
                          <div className="text-[10px] text-cyan-800 font-bold mt-0.5">
                            {msg.weatherData.condition}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-[10px] space-y-0.5">
                        <p className="text-slate-600">
                          Feels Like: <strong className="text-slate-900">{msg.weatherData.feelsLike}</strong>
                        </p>
                        <p className="text-amber-800 font-bold">
                          High / Low: {msg.weatherData.tempMax} / {msg.weatherData.tempMin}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-500 block font-semibold flex items-center justify-center gap-1">
                          <Droplets className="w-2.5 h-2.5 text-cyan-600" /> Humidity
                        </span>
                        <span className="font-mono font-bold text-slate-800">{msg.weatherData.humidity}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-500 block font-semibold flex items-center justify-center gap-1">
                          <Wind className="w-2.5 h-2.5 text-indigo-600" /> Wind Speed
                        </span>
                        <span className="font-mono font-bold text-slate-800">{msg.weatherData.windSpeed}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-500 block font-semibold flex items-center justify-center gap-1">
                          <CloudSun className="w-2.5 h-2.5 text-amber-600" /> Rain Chance
                        </span>
                        <span className="font-mono font-bold text-cyan-800">{msg.weatherData.rainProb}</span>
                      </div>
                    </div>

                    {msg.weatherData.travelAdvice && (
                      <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-200 text-[10px] text-indigo-900 flex items-start gap-1.5">
                        <span className="shrink-0 text-amber-800 font-bold">💡 HSK Concierge:</span>
                        <span>{msg.weatherData.travelAdvice}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Route Data Summary Card */}
                {msg.routeData && (
                  <div className="border border-indigo-200 rounded-2xl p-3.5 max-w-[92%] space-y-2.5 text-slate-900 shadow-md bg-indigo-50/60">
                    <div className="flex items-center justify-between border-b border-indigo-200 pb-1.5">
                      <h4 className="font-extrabold text-xs text-indigo-900 flex items-center gap-1.5 font-['Manrope']">
                        <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Route Overview</span>
                      </h4>
                      <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded border border-indigo-300">
                        Distance & Time
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-700">
                      <p>
                        <strong className="text-slate-900">Route:</strong> {msg.routeData.origin} → {msg.routeData.destination}
                      </p>
                      {msg.routeData.distance && (
                        <p className="text-emerald-800 font-bold">
                          Distance & Duration: {msg.routeData.distance} (~{msg.routeData.duration})
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Structured Itinerary Card */}
                {msg.card && (
                  <div className="border border-amber-200 rounded-2xl p-3.5 max-w-[92%] space-y-2.5 text-slate-900 shadow-md bg-amber-50/50">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                      <h4 className="font-extrabold text-xs text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>{msg.card.title}</span>
                      </h4>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                        Custom Itinerary
                      </span>
                    </div>

                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {msg.card.days.map((day, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{day}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="bg-white p-2 rounded-xl border border-slate-200 text-[10px] space-y-0.5">
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Vehicle:</strong> {msg.card.recommendedVehicle}
                      </p>
                      <p className="text-amber-800 font-bold">
                        Estimate: {msg.card.estPrice}
                      </p>
                    </div>
                  </div>
                )}

                {/* Google Maps Grounding Card */}
                {msg.mapPlaces && msg.mapPlaces.length > 0 && (
                  <div className="border border-emerald-200 rounded-2xl p-3.5 max-w-[92%] space-y-2 text-slate-900 shadow-md bg-emerald-50/60">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                      <h4 className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5 font-['Manrope']">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Google Maps Location Data</span>
                      </h4>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        MAPS GROUNDED
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.mapPlaces.map((place, pIdx) => (
                        <div key={pIdx} className="bg-white p-2 rounded-xl border border-emerald-200 flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1">
                              <span>📍</span>
                              <span>{place.title}</span>
                            </h5>
                            {place.snippet && (
                              <p className="text-[10px] text-slate-600 italic leading-snug">
                                "{place.snippet}"
                              </p>
                            )}
                          </div>
                          <a
                            href={place.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 transition shadow-xs cursor-pointer"
                          >
                            <span>Open Map</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-800 p-3 rounded-2xl border border-amber-200 w-max text-xs animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin text-amber-600" />
                <span>Gemini is thinking & analyzing route data...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0 no-scrollbar">
            <button
              type="button"
              onClick={() => handleSend('Which vehicles are available right now?')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer border border-emerald-300 transition flex items-center gap-1"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              <span>Available Vehicles?</span>
            </button>
            <button
              type="button"
              onClick={() => handleSend('What is the current temperature and weather in Coimbatore?')}
              className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer border border-cyan-300 transition flex items-center gap-1"
            >
              🌡️ Coimbatore
            </button>
            <button
              type="button"
              onClick={() => handleSend('What is the climate and rain forecast in Trichy right now?')}
              className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer border border-cyan-300 transition flex items-center gap-1"
            >
              🌦️ Trichy
            </button>
            <button
              type="button"
              onClick={() => handleSend('What is the current weather and temperature in Tirupati?')}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer border border-amber-300 transition flex items-center gap-1"
            >
              ☀️ Tirupati
            </button>
            <button
              type="button"
              onClick={() => handleSend('What is the weather in Salem today?')}
              className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer border border-purple-300 transition flex items-center gap-1"
            >
              🌤️ Salem
            </button>
            <button
              type="button"
              onClick={() => handleSend('Plan a 3-day trip to Ooty for 8 people')}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer border border-slate-300 transition"
            >
              🏔️ 3 Days Ooty
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask route, bus spec, or plan a trip..."
              className="flex-1 bg-slate-100 text-slate-900 placeholder:text-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
            />
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white p-2.5 rounded-xl transition cursor-pointer disabled:opacity-40 border border-transparent shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white p-3.5 rounded-2xl shadow-2xl shadow-indigo-600/40 border border-white/30 cursor-pointer flex items-center gap-2.5 transition transform hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900 animate-ping" />
          )}
        </div>
        <span className="font-extrabold text-xs tracking-wider uppercase hidden sm:inline-block font-['Manrope']">
          {isOpen ? 'Close Chat' : 'Gemini AI Assistant'}
        </span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-300" />
        ) : (
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono text-amber-200 border border-white/20 hidden sm:inline-block">
            24/7 AI
          </span>
        )}
      </button>
    </div>
  );
};
