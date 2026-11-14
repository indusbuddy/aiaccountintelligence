/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PriorityType, ResearchStatusType, StakeholderStatusType } from '../types';

interface StatusBadgeProps {
  id: string;
  type: 'priority' | 'research' | 'stakeholder';
  value: PriorityType | ResearchStatusType | StakeholderStatusType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  id,
  type,
  value
}) => {
  const getStyles = () => {
    const val = value.toString().trim();
    
    if (type === 'priority') {
      switch (val) {
        case 'High':
          return 'bg-rose-50 text-rose-700 border-rose-100';
        case 'Medium':
          return 'bg-amber-50 text-amber-700 border-amber-100';
        case 'Low':
          return 'bg-slate-50 text-slate-600 border-slate-100';
        default:
          return 'bg-gray-50 text-gray-600 border-gray-150';
      }
    }

    if (type === 'research') {
      switch (val) {
        case 'Completed':
          return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        case 'In Progress':
          return 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse';
        case 'Not Started':
          return 'bg-gray-50 text-gray-500 border-gray-150';
        default:
          return 'bg-gray-50 text-gray-600 border-gray-150';
      }
    }

    if (type === 'stakeholder') {
      switch (val) {
        case 'Engaged':
          return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        case 'Active':
          return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        case 'Contacted':
          return 'bg-amber-50 text-amber-700 border-amber-100';
        case 'No Contact':
          return 'bg-slate-100 text-slate-600 border-slate-200';
        default:
          return 'bg-gray-50 text-gray-600 border-gray-150';
      }
    }

    return 'bg-gray-50 text-gray-600 border-gray-100';
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`}
    >
      {value}
    </span>
  );
};
