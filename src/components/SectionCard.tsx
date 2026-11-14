/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SectionCardProps {
  id: string;
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  id,
  title,
  subtitle,
  headerActions,
  children,
  className = ''
}) => {
  return (
    <div
      id={id}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}
    >
      {(title || subtitle || headerActions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-slate-50 gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#091540]">{title}</h3>
            {subtitle && <p className="mt-1 text-xs text-gray-400 font-normal">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
