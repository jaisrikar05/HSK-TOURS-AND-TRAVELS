import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  lightMode?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10", showText = true, lightMode = true }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* HSK Compass Logo SVG */}
      <svg className="h-10 w-10 shrink-0 filter drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Compass Circle */}
        <circle cx="250" cy="250" r="210" stroke={lightMode ? "#818CF8" : "#38BDF8"} strokeWidth="14" strokeDasharray="1200" strokeDashoffset="0" />
        
        {/* Compass Points */}
        <polygon points="250,15 268,60 232,60" fill={lightMode ? "#818CF8" : "#38BDF8"} />
        <polygon points="250,485 268,440 232,440" fill={lightMode ? "#818CF8" : "#38BDF8"} />
        <polygon points="15,250 60,232 60,268" fill={lightMode ? "#818CF8" : "#38BDF8"} />
        <polygon points="485,250 440,232 440,268" fill={lightMode ? "#818CF8" : "#38BDF8"} />

        {/* Globe Grid Lines */}
        <ellipse cx="250" cy="250" rx="140" ry="200" stroke={lightMode ? "rgba(255,255,255,0.4)" : "#00215E"} strokeWidth="6" />
        <line x1="50" y1="250" x2="450" y2="250" stroke={lightMode ? "rgba(255,255,255,0.4)" : "#00215E"} strokeWidth="6" />
        <path d="M 90,170 Q 250,130 410,170" fill="none" stroke={lightMode ? "rgba(255,255,255,0.3)" : "#00215E"} strokeWidth="5" />
        <path d="M 90,330 Q 250,370 410,330" fill="none" stroke={lightMode ? "rgba(255,255,255,0.3)" : "#00215E"} strokeWidth="5" />

        {/* Waves at bottom */}
        <path d="M 140,360 Q 200,340 260,370 T 380,360" fill="none" stroke="#38BDF8" strokeWidth="12" strokeLinecap="round" />
        <path d="M 160,395 Q 220,375 280,405 T 360,395" fill="none" stroke="#818CF8" strokeWidth="12" strokeLinecap="round" />

        {/* Palm Tree */}
        <path d="M 180,330 Q 170,250 175,210" stroke="#34D399" strokeWidth="14" strokeLinecap="round" />
        <path d="M 175,210 Q 120,180 135,230" fill="none" stroke="#34D399" strokeWidth="10" strokeLinecap="round" />
        <path d="M 175,210 Q 230,180 215,230" fill="none" stroke="#34D399" strokeWidth="10" strokeLinecap="round" />
        <path d="M 175,210 Q 150,150 120,170" fill="none" stroke="#34D399" strokeWidth="10" strokeLinecap="round" />
        <path d="M 175,210 Q 200,150 230,170" fill="none" stroke="#34D399" strokeWidth="10" strokeLinecap="round" />

        {/* HSK Letters Box */}
        <rect x="235" y="200" width="135" height="100" rx="12" fill="rgba(15, 23, 42, 0.9)" stroke="#818CF8" strokeWidth="8" />
        <text x="302" y="272" fontFamily="IBM Plex Sans, sans-serif" fontWeight="900" fontSize="72" fill="#38BDF8" textAnchor="middle">HSK</text>

        {/* Airplane */}
        <path d="M 320,180 L 410,100 L 430,115 L 375,160 L 420,175 L 430,165 L 438,175 L 420,195 L 360,185 Z" fill="#F43F5E" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-wider text-xl font-['Manrope'] ${lightMode ? 'text-slate-900' : 'text-[#00215E]'}`}>
            HSK TOURS &
          </span>
          <span className={`font-bold tracking-[0.25em] text-sm font-['Manrope'] ${lightMode ? 'text-indigo-600' : 'text-blue-600'}`}>
            TRAVELS
          </span>
        </div>
      )}
    </div>
  );
};
