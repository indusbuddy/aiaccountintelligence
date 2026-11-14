/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from './StatCard';
import { SectionCard } from './SectionCard';
import { Timeline } from './Timeline';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { SignalsRefreshModal } from './SignalsRefreshModal';
import * as Lucide from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const { accounts, activities, navigate } = useApp();
  const [showSignalsModal, setShowSignalsModal] = useState(false);

  // Metrics calculations
  const totalAccounts = accounts.length;
  const researchCompleted = accounts.filter(a => a.researchStatus === 'Completed').length;
  const researchInProgress = accounts.filter(a => a.researchStatus === 'In Progress').length;
  const highOpportunity = accounts.filter(a => a.opportunityScore >= 80).length;

  const topOpportunities = [...accounts]
    .filter(a => a.opportunityScore > 0)
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 4);

  const upcomingTasks = [
    { id: 't_1', title: 'Schedule Discovery Workshop', company: 'Pfizer Inc.', priority: 'High', due: 'Today' },
    { id: 't_2', title: 'Draft Custom AI Alignment Pitch', company: 'Nike, Inc.', priority: 'High', due: 'Tomorrow' },
    { id: 't_3', title: 'Upload Q3 Earnings Deck', company: 'Target Corporation', priority: 'Medium', due: 'In 2 days' },
    { id: 't_4', title: 'Verify LinkedIn Stakeholder Mapping', company: 'Intel Corporation', priority: 'Medium', due: 'In 3 days' }
  ];

  return (
    <div id="dashboard-screen-root" className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#091540] sm:text-3xl">Executive Dashboard</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Real-time Account Based Marketing (ABM) research and client alignment index.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSignalsModal(true)}
            className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-bold text-[#091540] bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-2xs transition-all duration-200 cursor-pointer gap-1.5"
            title="Refresh all accounts for new market signals and notify respective account owners, Mahesh & Srini"
          >
            <Lucide.Radio className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Refresh Signals & Notify</span>
          </button>
          <button
            onClick={() => navigate('accounts', null, 'overview', true)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#091540] hover:bg-[#1f2e70] rounded-lg shadow-sm transition-all duration-200"
          >
            <Lucide.PlusCircle className="w-4 h-4 mr-2" />
            Register New Account
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          id="stat-total-accounts"
          title="Total Target Accounts"
          value={totalAccounts}
          iconName="Building2"
          change={{ value: '12%', isPositive: true }}
          onClick={() => navigate('accounts')}
          colorClass="text-[#091540] bg-slate-50"
        />
        <StatCard
          id="stat-research-completed"
          title="Research Completed"
          value={researchCompleted}
          iconName="Cpu"
          change={{ value: '18%', isPositive: true }}
          onClick={() => navigate('accounts')}
          colorClass="text-emerald-700 bg-emerald-50"
        />
        <StatCard
          id="stat-research-progress"
          title="Research In Progress"
          value={researchInProgress}
          iconName="Activity"
          onClick={() => navigate('accounts')}
          colorClass="text-blue-600 bg-blue-50"
        />
        <StatCard
          id="stat-high-opps"
          title="High Opportunity"
          value={highOpportunity}
          iconName="TrendingUp"
          change={{ value: '5%', isPositive: true }}
          onClick={() => navigate('accounts')}
          colorClass="text-indigo-600 bg-indigo-50"
        />
      </div>

      {/* Bento Grid Analytics Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* BLOCK 1: Opportunity Index & Heatmap (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <SectionCard
            id="dashboard-heatmap"
            title="Opportunity Index Heatmap"
            subtitle="Commercial suitability mapping against organizational AI alignment score."
            className="flex-1 flex flex-col justify-between"
            headerActions={
              <button 
                onClick={() => navigate('accounts')}
                className="text-xs font-bold text-[#2563FF] hover:text-[#0c44dd] flex items-center gap-1 transition-colors cursor-pointer"
              >
                View all accounts <Lucide.ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              {topOpportunities.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">No active opportunity ratings.</div>
              ) : (
                <div className="space-y-3.5">
                  {topOpportunities.map((acc) => (
                    <div 
                      key={acc.id} 
                      onClick={() => navigate('accounts', acc.id, 'overview')}
                      className="group p-3.5 bg-slate-50/70 hover:bg-[#2563FF]/5 border border-slate-100 hover:border-[#2563FF]/20 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white border border-gray-150 flex items-center justify-center text-[#091540] font-bold text-xs shadow-xs group-hover:scale-105 group-hover:bg-[#2563FF] group-hover:text-white transition-all">
                          {acc.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-gray-900 group-hover:text-[#2563FF] transition-colors leading-none">
                            {acc.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-medium mt-1">
                            {acc.industry} • {acc.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 min-w-[150px] sm:min-w-[180px]">
                        <ProgressBar id={`dash-progress-${acc.id}`} value={acc.opportunityScore} showLabel={true} size="xs" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Interactive Heatmap Matrix */}
              <div className="pt-4 mt-4 border-t border-slate-50">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Account suitability Map</span>
                  <span className="text-[9px] font-bold text-[#2563FF] bg-blue-50/80 px-2 py-0.5 rounded-full">Interactive benchmark</span>
                </div>
                <div className="grid grid-cols-12 gap-1.5">
                  {accounts.map((acc) => {
                    const opacity = Math.max(0.2, acc.opportunityScore / 100);
                    return (
                      <div
                        key={`cell-${acc.id}`}
                        onClick={() => navigate('accounts', acc.id, 'overview')}
                        className="aspect-square rounded-md bg-[#2563FF] transition-all duration-300 hover:scale-115 hover:shadow-md cursor-pointer relative group"
                        style={{ opacity }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 bg-[#091540] text-white text-[9px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap">
                          {acc.name} ({acc.opportunityScore}%)
                        </div>
                      </div>
                    );
                  })}
                  {Array.from({ length: Math.max(12, 36 - accounts.length) }).map((_, i) => {
                    const mockScore = Math.floor(Math.random() * 45) + 15;
                    const opacity = mockScore / 100;
                    return (
                      <div
                        key={`filler-${i}`}
                        className="aspect-square rounded-md bg-slate-200/80 transition-all duration-300 hover:scale-115 hover:bg-[#2563FF]/30 relative group cursor-help"
                        style={{ opacity }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 bg-[#091540] text-white text-[9px] font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
                          System Index Bench: {mockScore}%
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                  <span>Cold Suitability</span>
                  <span>AI Acceleration Horizon</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* BLOCK 2: Research Status Distribution & Active Progress (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <SectionCard
            id="dashboard-progress-chart"
            title="Research Status Distribution"
            subtitle="Overall mapping completion rate of global account index."
            className="flex-1 flex flex-col justify-between"
          >
            <div className="flex flex-col gap-6 h-full justify-between">
              
              {/* Top Row: Visual circular gauge + metrics legend */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                
                {/* Gauge (5 cols) */}
                <div className="sm:col-span-5 flex justify-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="41" className="stroke-slate-50 fill-none" strokeWidth="8" />
                      <circle 
                        cx="50" cy="50" r="41" 
                        className="stroke-[#2563FF] fill-none transition-all duration-1000 ease-out" 
                        strokeWidth="8" 
                        strokeDasharray="257.6" 
                        strokeDashoffset={257.6 - (257.6 * (researchCompleted / (totalAccounts || 1)))}
                      />
                      <circle 
                        cx="50" cy="50" r="41" 
                        className="stroke-amber-400 fill-none transition-all duration-1000 ease-out" 
                        strokeWidth="8" 
                        strokeDasharray="257.6" 
                        strokeDashoffset={257.6 - (257.6 * ((researchCompleted + researchInProgress) / (totalAccounts || 1)))}
                        style={{ opacity: 0.3 }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-2xl font-black text-[#091540] tracking-tight leading-none">
                        {Math.round((researchCompleted / (totalAccounts || 1)) * 100)}%
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ready</span>
                    </div>
                  </div>
                </div>

                {/* Legend (7 cols) */}
                <div className="sm:col-span-7 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#2563FF] shrink-0" />
                      <span className="text-gray-500">Completed Intel</span>
                    </div>
                    <span className="text-gray-900 font-bold font-mono">{researchCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-gray-500">Mapping Active</span>
                    </div>
                    <span className="text-gray-900 font-bold font-mono">{researchInProgress}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-200 shrink-0" />
                      <span className="text-gray-500">Awaiting Analysis</span>
                    </div>
                    <span className="text-gray-900 font-bold font-mono">{totalAccounts - researchCompleted - researchInProgress}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Active Research Progress bars (like Bento widget) */}
              <div className="pt-4 border-t border-slate-50 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Pipelines</span>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Analysis live</span>
                </div>
                <div className="space-y-2.5">
                  {accounts.slice(0, 3).map((acc) => {
                    const progressVal = acc.researchStatus === 'Completed' ? 100 : acc.researchStatus === 'In Progress' ? 65 : 15;
                    const statusColor = acc.researchStatus === 'Completed' ? 'bg-[#2563FF]' : acc.researchStatus === 'In Progress' ? 'bg-amber-400' : 'bg-slate-200';
                    return (
                      <div key={`active-res-${acc.id}`} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-700 truncate max-w-[150px]">{acc.name}</span>
                          <span className="text-gray-500 font-mono text-[10px]">{progressVal}%</span>
                        </div>
                        <div className="w-full bg-slate-50 border border-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`${statusColor} h-full rounded-full transition-all duration-500`} style={{ width: `${progressVal}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </SectionCard>
        </div>

        {/* BLOCK 3: System Operations Log / Activities Timeline (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <SectionCard
            id="dashboard-activities"
            title="System Operations Log"
            subtitle="Chronological feed of co-innovation outputs and research agent updates."
            className="flex-1 flex flex-col justify-between"
          >
            <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              <Timeline
                id="dash-timeline"
                activities={activities}
                maxItems={6}
                onAccountClick={(accId) => navigate('accounts', accId, 'overview')}
              />
            </div>
          </SectionCard>
        </div>

        {/* BLOCK 4: Schedules & Objectives Checklist (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <SectionCard
            id="dashboard-tasks"
            title="Schedules & Objectives"
            subtitle="Active action items assigned by enterprise strategy rules."
            className="flex-1 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-slate-50/70 border border-slate-100 rounded-2xl hover:border-[#2563FF]/20 hover:bg-white transition-all duration-200 flex items-start gap-3 shadow-xs"
                >
                  <button 
                    onClick={() => alert(`Task marked completed: ${task.title}`)}
                    className="mt-0.5 w-4 h-4 rounded border border-slate-300 hover:border-[#2563FF] hover:bg-[#2563FF]/10 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    title="Mark task completed"
                  >
                    <div className="w-1.5 h-1.5 rounded bg-transparent group-hover:bg-[#2563FF]" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-gray-900 leading-tight truncate">
                      {task.title}
                    </h5>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                      Account: <span className="font-semibold text-gray-600">{task.company}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.2 rounded text-[9px] font-bold bg-white border border-slate-150 text-gray-400 font-mono">
                        {task.due}
                      </span>
                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold border font-mono ${
                        task.priority === 'High' 
                          ? 'bg-rose-50 text-rose-600 border-rose-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

      </div>

      {/* Signals Refresh & Notification Modal */}
      <SignalsRefreshModal
        isOpen={showSignalsModal}
        onClose={() => setShowSignalsModal(false)}
      />
    </div>
  );
};
