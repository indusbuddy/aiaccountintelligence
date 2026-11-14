/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ProgressBarProps {
  id: string;
  value: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  id,
  value,
  showLabel = true,
  size = 'md'
}) => {
  // Determine color based on value
  const getColorClass = (val: number) => {
    if (val >= 80) return 'bg-[#2563FF]'; // Azure Blue
    if (val >= 60) return 'bg-indigo-500';
    if (val >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getBgColorClass = (val: number) => {
    if (val >= 80) return 'bg-blue-50';
    if (val >= 60) return 'bg-indigo-50';
    if (val >= 40) return 'bg-amber-50';
    return 'bg-rose-50';
  };

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }[size];

  return (
    <div id={id} className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-gray-500">Score Rating</span>
          <span className="text-xs font-bold text-gray-900 font-mono">{value}%</span>
        </div>
      )}
      <div className={`w-full rounded-full overflow-hidden ${getBgColorClass(value)} ${heightClass}`}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getColorClass(value)}`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};
