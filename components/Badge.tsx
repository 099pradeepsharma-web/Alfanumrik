
import React from 'react';
import { BADGES } from '../constants';

interface BadgeProps {
  badgeId: string;
}

const Badge: React.FC<BadgeProps> = ({ badgeId }) => {
  const badgeInfo = BADGES[badgeId];

  if (!badgeInfo) {
    return null;
  }

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-center transition-transform duration-200 hover:scale-105 hover:shadow-lg">
      <span className="text-4xl mb-2">{badgeInfo.icon}</span>
      <h4 className="font-bold text-slate-800 dark:text-slate-100">{badgeInfo.name}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400">{badgeInfo.description}</p>
    </div>
  );
};

export default Badge;