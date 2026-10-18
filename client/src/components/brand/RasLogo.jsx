import React from 'react';

export default function RasLogo({
  variant = 'dark', // 'dark' (for dark bg), 'light' (for light bg), 'crest-only'
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl'
  showTagline = true,
  className = '',
}) {
  const sizeClasses = {
    xs: 'h-8',
    sm: 'h-10',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Heraldic Shield Crest Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${
        size === 'xs' ? 'w-8 h-9' :
        size === 'sm' ? 'w-10 h-11' :
        size === 'md' ? 'w-12 h-14' :
        size === 'lg' ? 'w-16 h-18' : 'w-20 h-24'
      }`}>
        <svg viewBox="0 0 100 115" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id={`goldGradLogo-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
            <linearGradient id={`bgShieldGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0A1128" />
              <stop offset="100%" stopColor="#1C2541" />
            </linearGradient>
          </defs>
          
          {/* Shield outline */}
          <path
            d="M50 2 C77 2 96 20 96 48 C96 82 50 112 50 112 C50 112 4 82 4 48 C4 20 23 2 50 2 Z"
            fill={`url(#bgShieldGrad-${variant})`}
            stroke={`url(#goldGradLogo-${variant})`}
            strokeWidth="3.5"
          />
          {/* Inner subtle border */}
          <path
            d="M50 8 C72 8 88 24 88 48 C88 77 50 102 50 102 C50 102 12 77 12 48 C12 24 28 8 50 8 Z"
            fill="none"
            stroke={`url(#goldGradLogo-${variant})`}
            strokeWidth="1.2"
            strokeDasharray="2 3"
            opacity="0.6"
          />

          {/* Royal Crown */}
          <path
            d="M36 24 L42 29 L50 18 L58 29 L64 24 L62 34 L38 34 Z"
            fill={`url(#goldGradLogo-${variant})`}
          />

          {/* Bold Monogram */}
          <text
            x="50"
            y="48"
            fontFamily="'Outfit', 'Helvetica', sans-serif"
            fontWeight="900"
            fontSize="18"
            fill={`url(#goldGradLogo-${variant})`}
            textAnchor="middle"
            letterSpacing="1"
          >
            RAS
          </text>

          {/* Luxury Car Silhouette */}
          <path
            d="M28 72 C35 65 44 64 50 64 C56 64 65 65 72 72 L76 78 C76 80 74 81 72 81 L28 81 C26 81 24 80 24 78 Z"
            fill={`url(#goldGradLogo-${variant})`}
          />
          <circle cx="36" cy="81" r="4.5" fill="#0A1128" stroke={`url(#goldGradLogo-${variant})`} strokeWidth="1.8" />
          <circle cx="64" cy="81" r="4.5" fill="#0A1128" stroke={`url(#goldGradLogo-${variant})`} strokeWidth="1.8" />

          {/* Laurel arcs */}
          <path d="M20 40 C16 50 18 62 25 72" stroke={`url(#goldGradLogo-${variant})`} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M80 40 C84 50 82 62 75 72" stroke={`url(#goldGradLogo-${variant})`} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      {variant !== 'crest-only' && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className={`font-black tracking-tight font-heading ${
              size === 'xs' ? 'text-sm' :
              size === 'sm' ? 'text-base' :
              size === 'md' ? 'text-xl' :
              size === 'lg' ? 'text-2xl' : 'text-3xl'
            } ${isDark ? 'text-white' : 'text-slate-900'}`}>
              RAS
            </span>
            <span className={`font-black tracking-wider uppercase font-heading bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent ${
              size === 'xs' ? 'text-sm' :
              size === 'sm' ? 'text-base' :
              size === 'md' ? 'text-xl' :
              size === 'lg' ? 'text-2xl' : 'text-3xl'
            }`}>
              BROTHER
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-amber-500">★</span>
            <span className={`font-bold tracking-[0.22em] uppercase ${
              size === 'xs' ? 'text-[8px]' :
              size === 'sm' ? 'text-[9px]' :
              size === 'md' ? 'text-[10px]' :
              size === 'lg' ? 'text-xs' : 'text-sm'
            } ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              TOUR &amp; TRAVELS
            </span>
            <span className="text-[10px] text-amber-500">★</span>
          </div>

          {showTagline && size !== 'xs' && size !== 'sm' && (
            <span className={`text-[8px] font-medium tracking-wider uppercase mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Local Car Rental &amp; Event Booking Marketplace
            </span>
          )}
        </div>
      )}
    </div>
  );
}
