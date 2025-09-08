
import React from 'react';

const Spinner: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      {text && <p className="text-indigo-600 dark:text-indigo-400">{text}</p>}
    </div>
  );
};

export default Spinner;
