import React from 'react';
import RasLogo from '../brand/RasLogo';

export default function LoadingSpinner({ message = 'Loading RAS Brother Tour & Travels...' }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Animated Brand Crest */}
      <div className="relative flex flex-col items-center space-y-6 animate-pulse">
        <RasLogo variant="dark" size="xl" showTagline={true} />
        
        {/* Glowing Progress Indicator */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 w-full animate-pulse" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
          {message}
        </p>
      </div>
    </div>
  );
}
