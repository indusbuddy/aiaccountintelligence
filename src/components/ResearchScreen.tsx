/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { SignalsRefreshModal } from './SignalsRefreshModal';
import * as Lucide from 'lucide-react';
import { ResearchDepthType } from '../types';

export const ResearchScreen: React.FC = () => {
  const { accounts, triggerResearch, navigate } = useApp();
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'In Progress' | 'Not Started'>('All');
  const [showSignalsModal, setShowSignalsModal] = useState(false);

  const filteredAccounts = accounts.filter(acc => {
    if (statusFilter === 'All') return true;
    return acc.researchStatus === statusFilter;
  });

  return (
    <div id="research-control-center" className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#091540] sm:text-3xl">AI Research Control Center</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Trigger and manage autonomous research pipelines mapping target account digital structures and priorities.
          </p>
        </div>
        <button
          onClick={() => setShowSignalsModal(true)}
          className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-bold text-[#091540] bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-2xs transition-all duration-200 cursor-pointer gap-1.5 shrink-0"
          title="Refresh target accounts for new market signals and notify respective account owners, Mahesh & Srini"
        >
          <Lucide.Radio className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Refresh Signals & Notify</span>
        </button>
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
        <Lucide.Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <h4 className="text-xs font-bold text-blue-900">ABM Account Intelligence Best Practices</h4>
          <p className="text-[10px] text-blue-700 mt-1 leading-relaxed">
            Run standard AI agent crawls before client workshops to synchronize technology changes, strategic pivots, and executive hires. Custom prompt matrices can be managed under the <strong className="font-extrabold cursor-pointer hover:underline" onClick={() => navigate('templates')}>Templates</strong> tab.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200">
        {(['All', 'Completed', 'In Progress', 'Not Started'] as const).map((tab) => {
          const count = tab === 'All' ? accounts.length : accounts.filter(a => a.researchStatus === tab).length;
          const isActive = statusFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'border-[#091540] text-[#091540]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'All' && 'All Pipelines'}
              {tab === 'Completed' && 'Completed Summary'}
              {tab === 'In Progress' && 'Mapping Active'}
              {tab === 'Not Started' && 'Awaiting Analysis'}
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                isActive ? 'bg-[#091540] text-white' : 'bg-slate-100 text-gray-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Central Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center">
          <Lucide.Cpu className="w-10 h-10 text-gray-300 mb-2 animate-bounce" />
          <p className="text-xs font-bold text-gray-700">No pipelines in this state</p>
          <p className="text-[10px] text-gray-400 mt-1">Select another filter tab or add new target companies.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAccounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white border border-gray-100 shadow-xs rounded-xl p-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 border border-gray-150 flex items-center justify-center text-[#091540] font-black text-xs">
                    {acc.name.slice(0, 2).toUpperCase()}
                  </div>
                  <StatusBadge id={`res-status-badge-${acc.id}`} type="research" value={acc.researchStatus} />
                </div>

                <h4 className="mt-4 text-sm font-bold text-gray-900 leading-snug truncate">
                  {acc.name}
                </h4>
                
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {acc.industry} • {acc.country}
                </p>

                {acc.researchStatus === 'Completed' ? (
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400">
                      <span>Opportunity Index</span>
                      <span className="font-bold text-gray-800 font-mono">{acc.opportunityScore}%</span>
                    </div>
                    <ProgressBar id={`res-progress-${acc.id}`} value={acc.opportunityScore} showLabel={false} size="sm" />
                  </div>
                ) : (
                  <div className="mt-5 p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                    <span className="text-[10px] text-gray-400 italic font-medium">
                      {acc.researchStatus === 'In Progress' 
                        ? 'AI compilation active...' 
                        : 'Awaiting strategic mapping...'}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 font-mono">
                  Depth: {acc.researchDepth}
                </span>

                {acc.researchStatus === 'Not Started' && (
                  <button
                    onClick={() => triggerResearch(acc.id, acc.researchDepth)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#091540] hover:bg-[#1a2d7c] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Lucide.Cpu className="w-3 h-3" />
                    Start Agent
                  </button>
                )}

                {acc.researchStatus === 'In Progress' && (
                  <div className="text-xs font-bold text-blue-600 flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg">
                    <Lucide.Loader2 className="w-3 h-3 animate-spin" />
                    Running...
                  </div>
                )}

                {acc.researchStatus === 'Completed' && (
                  <button
                    onClick={() => navigate('accounts', acc.id, 'research')}
                    className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-[#091540] hover:bg-slate-50 border border-gray-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Lucide.SearchCode className="w-3 h-3" />
                    View Intel Report
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Signals Refresh & Notification Modal */}
      <SignalsRefreshModal
        isOpen={showSignalsModal}
        onClose={() => setShowSignalsModal(false)}
      />
    </div>
  );
};
