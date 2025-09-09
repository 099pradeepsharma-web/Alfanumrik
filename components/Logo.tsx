import React from 'react';

const Logo: React.FC<{ className?: string; textClassName?: string }> = ({ className, textClassName }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="AlfaNumric Home">
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />
        {/* Stylized 'A' for Alfa */}
        <path
          d="M 50 22 L 30 78 L 40.5 78 L 47 60 L 53 60 L 59.5 78 L 70 78 Z"
          fill="white"
        />
        <rect x="45" y="48" width="10" height="6" fill="white" />
      </svg>
      <span className={`font-bold text-slate-800 dark:text-slate-100 ${textClassName}`}>
        <span className="font-extrabold">Alfa</span>
        <span className="font-semibold text-slate-600 dark:text-slate-300">Numric</span>
      </span>
    </div>
  );
};

export default Logo;
