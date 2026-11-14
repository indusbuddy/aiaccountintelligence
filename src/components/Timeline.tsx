/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity } from '../types';
import * as Lucide from 'lucide-react';

interface TimelineProps {
  id: string;
  activities: Activity[];
  maxItems?: number;
  onAccountClick?: (accountId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  id,
  activities,
  maxItems = 10,
  onAccountClick
}) => {
  const items = activities.slice(0, maxItems);

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'account_created':
        return <Lucide.PlusCircle className="w-4 h-4 text-emerald-600" />;
      case 'research_started':
        return <Lucide.Flame className="w-4 h-4 text-amber-500 animate-pulse" />;
      case 'research_completed':
        return <Lucide.Cpu className="w-4 h-4 text-blue-600" />;
      case 'stakeholder_added':
        return <Lucide.UserPlus className="w-4 h-4 text-indigo-600" />;
      case 'document_uploaded':
        return <Lucide.FileUp className="w-4 h-4 text-sky-600" />;
      case 'opportunity_created':
        return <Lucide.TrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <Lucide.Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityBg = (type: Activity['type']) => {
    switch (type) {
      case 'account_created':
        return 'bg-emerald-50 border-emerald-100';
      case 'research_started':
        return 'bg-amber-50 border-amber-100';
      case 'research_completed':
        return 'bg-blue-50 border-blue-100';
      case 'stakeholder_added':
        return 'bg-indigo-50 border-indigo-100';
      case 'document_uploaded':
        return 'bg-sky-50 border-sky-100';
      case 'opportunity_created':
        return 'bg-purple-50 border-purple-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  if (items.length === 0) {
    return (
      <div id={id} className="text-center py-6 text-gray-400 text-sm">
        No recent activity logged.
      </div>
    );
  }

  return (
    <div id={id} className="flow-root">
      <ul className="-mb-8">
        {items.map((activity, idx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {idx !== items.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3 items-start">
                <div>
                  <span className={`h-8 w-8 rounded-full border flex items-center justify-center ring-8 ring-white ${getActivityBg(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      {activity.description}
                    </p>
                    {activity.accountId && activity.accountName && onAccountClick && (
                      <button
                        onClick={() => onAccountClick(activity.accountId!)}
                        className="mt-1 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Lucide.Building className="w-3 h-3 mr-1" />
                        View Account details
                      </button>
                    )}
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-gray-400 font-mono">
                    {formatTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
