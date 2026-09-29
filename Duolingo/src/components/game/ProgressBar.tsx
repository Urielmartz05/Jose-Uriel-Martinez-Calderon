'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="flex-1 flex items-center gap-3">
      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden p-0.5 relative">
        <div
          className="h-full bg-duo-green rounded-full transition-all duration-300 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          {/* Subtle gloss highlight on progress bar */}
          <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
      <span className="text-xs font-black text-duo-muted min-w-[3rem] text-right">
        {current}/{total}
      </span>
    </div>
  );
}

export default ProgressBar;
