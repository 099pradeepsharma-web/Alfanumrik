
import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, label }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mt-1">
        <div 
          className="bg-indigo-600 h-4 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
