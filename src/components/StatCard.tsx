/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Lucide from 'lucide-react';

interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  iconName: keyof typeof Lucide;
  change?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  iconName,
  change,
  onClick,
  colorClass = 'text-blue-600 bg-blue-50'
}) => {
  const IconComponent = Lucide[iconName] as React.ComponentType<{ className?: string }>;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`p-5 bg-white rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 flex flex-col justify-between h-full min-h-[135px] ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-[#2563FF]/30 hover:scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          {IconComponent && <IconComponent className="w-5 h-5" />}
        </div>
        {change ? (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            change.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
          }`}>
            {change.isPositive ? '+' : '-'}{change.value}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Active</span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-3xl font-bold text-[#091540] tracking-tight leading-none">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-1">{title}</p>
      </div>
    </div>
  );
};
