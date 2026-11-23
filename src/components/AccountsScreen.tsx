/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import * as Lucide from 'lucide-react';
import { PriorityType, ResearchStatusType } from '../types';
import { Account } from '../types';
import { ShareAccountModal } from './ShareAccountModal';
import { SignalsRefreshModal } from './SignalsRefreshModal';

export const AccountsScreen: React.FC = () => {
  const { accounts, navigate, deleteAccount, triggerResearch } = useApp();

  // Local Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'updated'>('score');
  const [sharingAccount, setSharingAccount] = useState<Account | null>(null);
  const [showSignalsModal, setShowSignalsModal] = useState(false);
  const [selectedSignalAccountId, setSelectedSignalAccountId] = useState<string | null>(null);

  // Unique list of industries for filtering
  const industries = ['All', ...Array.from(new Set(accounts.map(a => a.industry)))];

  // Filter & Sort Logic
  const filteredAccounts = accounts
    .filter(acc => {
      const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.industry.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIndustry = industryFilter === 'All' || acc.industry === industryFilter;
      const matchesPriority = priorityFilter === 'All' || acc.priority === priorityFilter;
      const matchesStatus = statusFilter === 'All' || acc.researchStatus === statusFilter;

      return matchesSearch && matchesIndustry && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'score') {
        return b.opportunityScore - a.opportunityScore;
      }
      if (sortBy === 'updated') {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
      return 0;
    });

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div id="accounts-screen-root" className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#091540] sm:text-3xl">Target Accounts</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Monitor and prioritize your key organizational prospects and co-innovation tracks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedSignalAccountId(null);
              setShowSignalsModal(true);
            }}
            className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-bold text-[#091540] bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-2xs transition-all duration-200 cursor-pointer gap-1.5"
            title="Refresh accounts for new buying signals and notify respective account owners and leadership"
          >
            <Lucide.Radio className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Refresh Signals & Notify</span>
          </button>
          <button
            onClick={() => navigate('accounts', null, 'overview', true)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#091540] hover:bg-[#1a2d7c] rounded-lg shadow-sm transition-all duration-250 cursor-pointer"
          >
            <Lucide.Plus className="w-4 h-4 mr-1.5" />
            Add Account
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Search Input */}
        <div className="relative md:col-span-4">
          <Lucide.Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search company, website, sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-medium text-gray-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
            >
              <Lucide.X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sector Filter */}
        <div className="md:col-span-2">
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden font-semibold text-gray-600"
          >
            <option value="All">All Sectors</option>
            {industries.filter(ind => ind !== 'All').map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="md:col-span-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden font-semibold text-gray-600"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Research Status Filter */}
        <div className="md:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden font-semibold text-gray-600"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Not Started">Not Started</option>
          </select>
        </div>

        {/* Sort Selection */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden font-semibold text-gray-600"
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="updated">Sort by Updated</option>
          </select>
        </div>
      </div>

      {/* Main Grid/Table Representation */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center">
          <div className="p-4 bg-slate-50 text-slate-300 rounded-full mb-3">
            <Lucide.SearchCode className="w-10 h-10" />
          </div>
          <h3 className="text-base font-bold text-[#091540]">No matching accounts</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
            Try adjusting your fuzzy search query or removing active status/priority filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4.5">Company</th>
                  <th className="px-6 py-4.5">Sector</th>
                  <th className="px-6 py-4.5">Country</th>
                  <th className="px-6 py-4.5 text-center">Priority</th>
                  <th className="px-6 py-4.5 text-center">Research Status</th>
                  <th className="px-6 py-4.5 min-w-[150px]">Opportunity Index</th>
                  <th className="px-6 py-4.5 text-center">Last Synced</th>
                  <th className="px-6 py-4.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {filteredAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Name + Website */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 border border-gray-150 flex items-center justify-center text-[#091540] font-black text-xs shrink-0 shadow-xs">
                          {acc.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => navigate('accounts', acc.id, 'overview')}
                            className="font-bold text-gray-900 hover:text-[#2563FF] hover:underline cursor-pointer block text-left"
                          >
                            {acc.name}
                          </button>
                          <a
                            href={acc.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-gray-400 font-medium inline-flex items-center gap-0.5 mt-0.5 hover:text-gray-600"
                          >
                            {acc.website.replace(/^https?:\/\//i, '')} <Lucide.ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="px-6 py-4 text-gray-500 max-w-[180px] truncate">
                      {acc.industry}
                    </td>

                    {/* Country */}
                    <td className="px-6 py-4 text-gray-500">
                      {acc.country}
                    </td>

                    {/* Priority Badge */}
                    <td className="px-6 py-4 text-center">
                      <StatusBadge id={`acc-priority-${acc.id}`} type="priority" value={acc.priority} />
                    </td>

                    {/* Research Status */}
                    <td className="px-6 py-4 text-center">
                      <StatusBadge id={`acc-status-${acc.id}`} type="research" value={acc.researchStatus} />
                    </td>

                    {/* Opportunity Score */}
                    <td className="px-6 py-4">
                      {acc.researchStatus === 'Completed' ? (
                        <div className="flex items-center gap-3">
                          <div className="w-16">
                            <ProgressBar id={`tbl-progress-${acc.id}`} value={acc.opportunityScore} showLabel={false} size="sm" />
                          </div>
                          <span className="font-bold text-gray-800 font-mono text-[11px]">{acc.opportunityScore}%</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Not compiled</span>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="px-6 py-4 text-center text-gray-400 font-mono text-[10px]">
                      {formatDate(acc.lastUpdated)}
                    </td>

                    {/* Actions Row */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {acc.researchStatus === 'Not Started' && (
                          <button
                            onClick={() => triggerResearch(acc.id, acc.researchDepth)}
                            className="p-1.5 bg-[#091540]/5 text-[#091540] hover:bg-[#091540]/10 rounded-md transition-colors"
                            title="Run AI Research Engine"
                          >
                            <Lucide.Cpu className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedSignalAccountId(acc.id);
                            setShowSignalsModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all cursor-pointer"
                          title={`Refresh market signals for ${acc.name} and notify ${acc.owner.split('(')[0].trim()} and leadership`}
                        >
                          <Lucide.Radio className="w-3.5 h-3.5 text-amber-500" />
                        </button>
                        <button
                          onClick={() => setSharingAccount(acc)}
                          className="p-1.5 text-gray-400 hover:text-[#2563FF] hover:bg-blue-50 rounded-md transition-all cursor-pointer"
                          title="Share Account with Team Members"
                        >
                          <Lucide.Share2 className="w-3.5 h-3.5 text-[#2563FF]" />
                        </button>
                        <button
                          onClick={() => navigate('accounts', acc.id, 'overview')}
                          className="p-1.5 text-gray-400 hover:text-[#091540] hover:bg-slate-100 rounded-md transition-all"
                          title="Open Analysis Studio"
                        >
                          <Lucide.Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${acc.name} from the target index? This deletes associated stake records and documents.`)) {
                              deleteAccount(acc.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                          title="De-register Account"
                        >
                          <Lucide.Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Share Account Dialog */}
      <ShareAccountModal
        account={sharingAccount}
        isOpen={!!sharingAccount}
        onClose={() => setSharingAccount(null)}
      />

      {/* Signals Refresh & Notification Modal */}
      <SignalsRefreshModal
        isOpen={showSignalsModal}
        onClose={() => setShowSignalsModal(false)}
        targetAccountId={selectedSignalAccountId}
      />
    </div>
  );
};
