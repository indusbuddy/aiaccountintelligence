/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Opportunity } from '../types';
import * as Lucide from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { useApp } from '../context/AppContext';

interface OpportunityCardProps {
  id: string;
  opportunity: Opportunity;
  onDelete?: (id: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  id,
  opportunity,
  onDelete
}) => {
  const { navigate } = useApp();
  return (
    <div
      id={id}
      className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start gap-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            {opportunity.service}
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(opportunity.id)}
              className="text-gray-400 hover:text-rose-600 p-1 rounded-md hover:bg-gray-50 transition-colors"
              title="Delete Opportunity"
            >
              <Lucide.Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <h4 className="mt-3 text-base font-bold text-gray-900 line-clamp-1">
          {opportunity.title}
        </h4>
        
        <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-3">
          {opportunity.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-50">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Estimated Contract Value</span>
            <span className="text-lg font-extrabold text-[#091540]">{opportunity.value}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Win Probability</span>
            <span className="text-sm font-bold text-emerald-600 font-mono">{opportunity.probability}%</span>
          </div>
        </div>

        <ProgressBar id={`opp-progress-${opportunity.id}`} value={opportunity.probability} showLabel={false} size="sm" />
        
        <div className="mt-3.5 flex items-center justify-between text-[10px] font-bold text-gray-400">
          <span className="uppercase tracking-wider">Trace status:</span>
          <button
            onClick={() => navigate('accounts', opportunity.accountId, 'evidence')}
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-150 px-1.5 py-0.5 rounded cursor-pointer transition-all"
          >
            <Lucide.Link className="w-2.5 h-2.5" />
            [Verified Signal Source]
          </button>
        </div>
      </div>
    </div>
  );
};
