/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { OpportunityCard } from './OpportunityCard';
import { TechnologyBadge } from './TechnologyBadge';
import { ResearchCard } from './ResearchCard';
import { FileUploader } from './FileUploader';
import { Timeline } from './Timeline';
import { EvidenceCollectionEngine } from './EvidenceCollectionEngine';
import { StakeholderIntelligence } from './StakeholderIntelligence';
import { 
  StakeholderRoleType, StakeholderInfluenceType, StakeholderStatusType, 
  PriorityType, ResearchDepthType 
} from '../types';
import * as Lucide from 'lucide-react';
import { exportCompanyResearchPDF } from '../lib/pdfGenerator';
import { ShareAccountModal } from './ShareAccountModal';
import { SignalsRefreshModal } from './SignalsRefreshModal';

export const AccountDetailsScreen: React.FC = () => {
  const { 
    selectedAccountId, accounts, stakeholders, opportunities, documents, activities,
    navigate, triggerResearch, rerunSingleModule, orchestratedResearches, addStakeholder, deleteStakeholder, 
    updateStakeholder, researchStakeholder,
    addOpportunity, deleteOpportunity, uploadDocument, deleteDocument,
    getResearchForAccount, currentDetailSubTab, evidence, addManualNote, triggerSourceIngestion
  } = useApp();

  const [activeModuleId, setActiveModuleId] = useState<string>('company');
  const [selectedDepth, setSelectedDepth] = useState<ResearchDepthType>('Standard');

  // Find the selected account
  const account = accounts.find(a => a.id === selectedAccountId);

  // Modal forms states
  const [showStakeholderModal, setShowStakeholderModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSignalsModal, setShowSignalsModal] = useState(false);
  const [selectedStakeholderId, setSelectedStakeholderId] = useState<string | null>(null);

  // New Stakeholder form state
  const [stkForm, setStkForm] = useState({
    inputMethod: 'manual' as 'linkedin' | 'manual',
    firstName: '',
    lastName: '',
    title: '',
    department: 'IT & Engineering',
    company: account?.name || '',
    email: '',
    linkedIn: '',
    notes: '',
    role: 'Influencer' as StakeholderRoleType,
    influence: 'Medium' as StakeholderInfluenceType,
    status: 'Active' as StakeholderStatusType,
  });

  // New Opportunity form state
  const [oppForm, setOppForm] = useState({
    title: '',
    description: '',
    service: 'Enterprise Strategy Consulting',
    value: '$150,000',
    probability: 50,
  });

  if (!account) {
    return (
      <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <Lucide.AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-bounce" />
        <h3 className="text-base font-bold text-gray-900">Account not found</h3>
        <p className="text-xs text-gray-400 mt-1 mb-4">The requested target account registration does not exist.</p>
        <button
          onClick={() => navigate('accounts')}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#091540] hover:bg-[#15276e] rounded-lg transition-all"
        >
          Return to Accounts
        </button>
      </div>
    );
  }

  // Filter local resources for this specific account
  const accountStakeholders = stakeholders.filter(s => s.accountId === account.id);
  const accountOpportunities = opportunities.filter(o => o.accountId === account.id);
  const accountDocuments = documents.filter(d => d.accountId === account.id);
  const accountActivities = activities.filter(a => a.accountId === account.id);
  const accountEvidence = (evidence || []).filter(e => e.accountId === account.id);
  const research = getResearchForAccount(account.id);

  const handleExportPDF = () => {
    if (!account) return;
    const activeRes = orchestratedResearches[account.id];
    exportCompanyResearchPDF(account, activeRes);
  };

  const handleSaveContact = async (shouldResearch: boolean) => {
    const name = `${stkForm.firstName} ${stkForm.lastName}`.trim();
    if (!name || !stkForm.title.trim()) {
      alert("First Name, Last Name, and Job Title are required.");
      return;
    }

    const newId = addStakeholder({
      accountId: account.id,
      name,
      title: stkForm.title,
      department: stkForm.department,
      linkedIn: stkForm.linkedIn || 'https://linkedin.com',
      role: stkForm.role,
      influence: stkForm.influence,
      status: stkForm.status,
      email: stkForm.email || undefined,
      company: stkForm.company || undefined,
      notes: stkForm.notes || undefined,
    });

    // Reset form
    setStkForm({
      inputMethod: 'manual',
      firstName: '',
      lastName: '',
      title: '',
      department: 'IT & Engineering',
      company: account?.name || '',
      email: '',
      linkedIn: '',
      notes: '',
      role: 'Influencer',
      influence: 'Medium',
      status: 'Active',
    });

    setShowStakeholderModal(false);

    if (shouldResearch) {
      setSelectedStakeholderId(newId);
      await researchStakeholder(newId);
    }
  };

  const handleAddOpportunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppForm.title.trim() || !oppForm.description.trim()) return;

    addOpportunity({
      accountId: account.id,
      title: oppForm.title,
      description: oppForm.description,
      service: oppForm.service,
      value: oppForm.value,
      probability: oppForm.probability,
    });

    // Reset Form
    setOppForm({
      title: '',
      description: '',
      service: 'Enterprise Strategy Consulting',
      value: '$150,000',
      probability: 50,
    });
    setShowOpportunityModal(false);
  };

  return (
    <div id="account-workspace" className="space-y-6 animate-fade-in">
      {/* Workspace Breadcrumbs & Top bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('accounts')}
            className="p-1.5 hover:bg-slate-50 text-gray-400 hover:text-gray-900 border border-gray-150 rounded-lg transition-colors cursor-pointer"
            title="Return to target list"
          >
            <Lucide.ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#091540] sm:text-2xl truncate">
                {account.name}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-mono px-2 py-0.5 bg-slate-100 rounded border border-slate-150 shrink-0">
                Studio Workspace
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Lucide.Globe className="w-3.5 h-3.5" />
              <a href={account.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {account.website.replace(/^https?:\/\//i, '')}
              </a>
              • {account.industry}
            </p>
          </div>
        </div>

        {/* Header KPI Stats */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Refresh Signals & Notify Button */}
          <button
            onClick={() => setShowSignalsModal(true)}
            className="px-3 py-2 text-xs font-bold text-[#091540] bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title={`Refresh buyer signals for ${account.name} and notify ${account.owner.split('(')[0].trim()}, Mahesh & Srini`}
          >
            <Lucide.Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Refresh Signals</span>
          </button>

          {/* Share Account Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-[#091540] bg-white border border-gray-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Share account with team members"
          >
            <Lucide.Share2 className="w-3.5 h-3.5 text-[#2563FF]" />
            <span>Share</span>
            {account.sharedWith && account.sharedWith.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-blue-100 text-[#2563FF] font-black">
                {account.sharedWith.length}
              </span>
            )}
          </button>

          {account.researchStatus === 'Completed' && (
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Lucide.FileDown className="w-3.5 h-3.5 text-red-500" />
              Export Briefing PDF
            </button>
          )}

          {account.researchStatus === 'Completed' ? (
            <div className="flex items-center gap-4 bg-[#091540]/5 border border-[#091540]/10 rounded-xl px-4 py-2">
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 block">Suitability Rating</span>
                <span className="text-sm font-black text-[#091540] font-mono">{account.opportunityScore}%</span>
              </div>
              <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className="h-full bg-[#2563FF] transition-all duration-1000" 
                  style={{ width: `${account.opportunityScore}%` }} 
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic">No score calculated</div>
          )}

          {account.researchStatus === 'Not Started' && (
            <button
              onClick={() => triggerResearch(account.id, account.researchDepth)}
              className="px-4 py-2 text-xs font-bold text-white bg-[#091540] hover:bg-[#1a2d7c] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Lucide.Cpu className="w-3.5 h-3.5" />
              Run Research
            </button>
          )}

          {account.researchStatus === 'In Progress' && (
            <div className="px-4 py-2 text-xs font-bold text-[#2563FF] bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
              <Lucide.Loader2 className="w-3.5 h-3.5 animate-spin" />
              AI Analyzing...
            </div>
          )}
        </div>
      </div>

      {/* Compile Progress Overlay */}
      {account.researchStatus === 'In Progress' && (
        <div className="p-4 bg-amber-50/75 border border-amber-200 rounded-xl flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3 min-w-0">
            <Lucide.Bot className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800">Background Synthesis Underway</p>
              <p className="text-[10px] text-amber-600 mt-0.5">
                Our autonomous research crawler is querying company filings, mapping technologies, and synthesizing opportunities. Complete compilation takes ~3.5 seconds.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              PENDING DATA
            </span>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-gray-100 bg-white p-1 rounded-xl shadow-xs inline-flex flex-wrap w-full">
        {[
          { key: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
          { key: 'research', label: 'Research', icon: 'Cpu' },
          { key: 'evidence', label: 'Evidence', icon: 'Library' },
          { key: 'documents', label: 'Documents', icon: 'FolderUp' },
          { key: 'stakeholders', label: 'Stakeholders', icon: 'Users2' },
          { key: 'opportunities', label: 'Opportunities', icon: 'TrendingUp' },
          { key: 'communication', label: 'Communication', icon: 'Mail' },
          { key: 'activity', label: 'Activity Logs', icon: 'History' },
        ].map((tab) => {
          const Icon = Lucide[tab.icon as keyof typeof Lucide] as React.ComponentType<{ className?: string }>;
          const isActive = currentDetailSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => navigate('accounts', account.id, tab.key)}
              className={`px-4.5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-[#091540] text-white shadow-xs'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-slate-50'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {tab.label}
              {tab.key === 'stakeholders' && accountStakeholders.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-gray-500'}`}>
                  {accountStakeholders.length}
                </span>
              )}
              {tab.key === 'documents' && accountDocuments.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-gray-500'}`}>
                  {accountDocuments.length}
                </span>
              )}
              {tab.key === 'evidence' && accountEvidence.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-gray-500'}`}>
                  {accountEvidence.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Screen Routing */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* ======================================================== OVERVIEW TAB */}
        {currentDetailSubTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Firmographic Detail Block */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-[#091540] border-b border-gray-50 pb-3 uppercase tracking-wider text-[11px]">Company profile</h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Sector / Industry</span>
                    <p className="text-xs font-semibold text-gray-700">{account.industry}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Geographic HQ</span>
                    <p className="text-xs font-semibold text-gray-700">{account.country} ({account.region})</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Account Owner</span>
                    <p className="text-xs font-semibold text-gray-700">{account.owner}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">ABM Priority</span>
                    <StatusBadge id={`detail-prio-${account.id}`} type="priority" value={account.priority} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Research Status</span>
                    <StatusBadge id={`detail-status-${account.id}`} type="research" value={account.researchStatus} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Sync Date</span>
                    <p className="text-xs font-mono font-medium text-gray-500">{new Date(account.lastUpdated).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business summary and metrics */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
                <h3 className="text-sm font-bold text-[#091540] border-b border-gray-50 pb-3 uppercase tracking-wider text-[11px] mb-4">Core Business Summary</h3>
                {account.researchStatus === 'Completed' && research ? (
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {research.overview}
                  </p>
                ) : (
                  <div className="py-6 text-center text-gray-400 text-xs">
                    <Lucide.Bot className="w-8 h-8 text-slate-200 mx-auto mb-2 animate-bounce" />
                    No summary compiled yet. Run AI agent to analyze this target's strategic model.
                  </div>
                )}
              </div>

              {/* Mini Account Timeline */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
                <h3 className="text-sm font-bold text-[#091540] border-b border-gray-50 pb-3 uppercase tracking-wider text-[11px] mb-5">Workspace Logs</h3>
                <Timeline id="details-overview-timeline" activities={accountActivities} maxItems={4} />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== RESEARCH TAB */}
        {currentDetailSubTab === 'research' && (() => {
          const activeRes = orchestratedResearches[account.id];
          const activePipeline = activeRes?.pipeline;
          const activeModule = activePipeline?.[activeModuleId];
          const activeModuleData = activeRes?.data?.[activeModuleId as keyof typeof activeRes.data];

          const PIPELINE_STEPS = [
            { id: 'company', name: 'Company Discovery', icon: 'Globe', description: 'Analyzes corporate identity, sector, competitors, and core profile details.' },
            { id: 'business', name: 'Business Analysis', icon: 'Activity', description: 'Formulates a robust SWOT matrix and assesses strategic market positioning.' },
            { id: 'technology', name: 'Technology Detection', icon: 'Database', description: 'Identifies core infrastructure stacks, cloud hosts, and database systems.' },
            { id: 'news', name: 'News Analysis', icon: 'FileText', description: 'Filters press releases, earnings statements, and public corporate announcements.' },
            { id: 'hiring', name: 'Hiring Analysis', icon: 'Briefcase', description: 'Tracks career board postings, demanded tech skills, and headcount growth.' },
            { id: 'financial', name: 'Financial Analysis', icon: 'DollarSign', description: 'Calculates fiscal indicators, revenue growth trends, and IT budget metrics.' },
            { id: 'strategic', name: 'Strategic Priorities', icon: 'Target', description: 'Maps immediate strategic plans, operational targets, and transformation roadmaps.' },
            { id: 'signals', name: 'Buying Signals', icon: 'Zap', description: 'Detects active buyer indicators, compliance spikes, and budget openings.' },
            { id: 'maturity', name: 'Digital Maturity', icon: 'Shield', description: 'Grades capability maturity in cloud, AI, databases, security, and developer processes.' },
            { id: 'opportunities', name: 'Opportunity Mapping', icon: 'TrendingUp', description: 'Constructs targeted proposals, workshops, and customer-specific discovery guides.' },
            { id: 'executive', name: 'Executive Summary', icon: 'Bot', description: 'Consolidates all module findings into a single consulting recommendation.' },
          ];

          if (account.researchStatus === 'Not Started') {
            return (
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-8 text-center space-y-6 max-w-4xl mx-auto animate-fade-in">
                <div className="h-16 w-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto animate-bounce">
                  <Lucide.Cpu className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-[#091540]">Initialize AI Account Intelligence Pipeline</h3>
                  <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
                    This orchestrates 11 specialized AI research agents to crawler company filings, detect tech landscapes, parse news sentiment, and construct enterprise opportunity roadmaps.
                  </p>
                </div>

                {/* Depth Selection Block */}
                <div className="p-5 bg-slate-50 border border-slate-150 rounded-xl max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Select Analysis Depth</span>
                    <div className="flex gap-2">
                      {(['Instant', 'Standard', 'Deep'] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => setSelectedDepth(d)}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                            selectedDepth === d 
                              ? 'bg-[#091540] text-white' 
                              : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-mono block">Estimated Time</span>
                    <span className="text-xs font-black text-[#091540] font-mono">
                      {selectedDepth === 'Instant' ? '1-2 seconds' : selectedDepth === 'Standard' ? '3-4 seconds' : '6-8 seconds'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => triggerResearch(account.id, selectedDepth)}
                    className="px-6 py-3 text-xs font-bold text-white bg-[#091540] hover:bg-[#15276e] rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Lucide.Play className="w-4 h-4 fill-current" />
                    Launch 11-Stage Research Orchestrator
                  </button>
                </div>

                {/* Pipeline Steps Preview */}
                <div className="border-t border-slate-100 pt-6">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-4">Pipeline Execution Sequence</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
                    {PIPELINE_STEPS.map((step, idx) => {
                      const Icon = Lucide[step.icon as keyof typeof Lucide] as React.ComponentType<{ className?: string }>;
                      return (
                        <div key={step.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center" title={step.description}>
                          <span className="text-[9px] font-mono font-bold text-gray-400 block mb-1">0{idx + 1}</span>
                          <div className="h-7 w-7 bg-white rounded-md border border-slate-150 flex items-center justify-center text-gray-400 mx-auto">
                            {Icon && <Icon className="w-3.5 h-3.5" />}
                          </div>
                          <p className="text-[8px] font-bold text-gray-500 truncate mt-1.5">{step.name.split(' ')[0]}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
              
              {/* LEFT SIDEBAR: Pipeline Step Feed (lg:col-span-4) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Coverage Rating Card */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Pipeline Coverage</h4>
                    <span className="text-xs font-mono font-black text-[#091540] bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">
                      {activeRes?.coverage.overallScore || 10}% Complete
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000" 
                      style={{ width: `${activeRes?.coverage.overallScore || 10}%` }} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 border-r border-slate-100 pr-2">
                      <span>SEC / Filings</span>
                      <span className={activeRes?.coverage.website === 'Complete' ? 'text-emerald-500' : 'text-amber-500'}>
                        {activeRes?.coverage.website || 'Partial'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 pl-1">
                      <span>Leadership</span>
                      <span className={activeRes?.coverage.leadership === 'Complete' ? 'text-emerald-500' : 'text-amber-500'}>
                        {activeRes?.coverage.leadership || 'Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 border-r border-slate-100 pr-2">
                      <span>Tech Stack</span>
                      <span className={activeRes?.coverage.technology === 'Complete' ? 'text-emerald-500' : 'text-amber-500'}>
                        {activeRes?.coverage.technology || 'Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 pl-1">
                      <span>News/PR</span>
                      <span className={activeRes?.coverage.news === 'Complete' ? 'text-emerald-500' : 'text-amber-500'}>
                        {activeRes?.coverage.news || 'Missing'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pipeline Sequence Control List */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Agent Pipelines</h4>
                    <button
                      onClick={() => triggerResearch(account.id, account.researchDepth)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Lucide.RotateCcw className="w-3 h-3" />
                      Rerun Pipeline
                    </button>
                  </div>

                  <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
                    {PIPELINE_STEPS.map((step, idx) => {
                      const Icon = Lucide[step.icon as keyof typeof Lucide] as React.ComponentType<{ className?: string }>;
                      const statusInfo = activePipeline?.[step.id];
                      const isSelected = activeModuleId === step.id;

                      let statusBadge = null;
                      if (statusInfo?.status === 'Completed') {
                        statusBadge = (
                          <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                            {statusInfo.confidence}% Conf
                          </span>
                        );
                      } else if (statusInfo?.status === 'Running') {
                        statusBadge = (
                          <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded flex items-center gap-1 shrink-0 animate-pulse">
                            <Lucide.Loader2 className="w-2.5 h-2.5 animate-spin" />
                            Active
                          </span>
                        );
                      } else if (statusInfo?.status === 'Failed') {
                        statusBadge = (
                          <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded shrink-0">
                            Failed
                          </span>
                        );
                      } else {
                        statusBadge = (
                          <span className="text-[9px] font-mono font-bold text-gray-400 bg-slate-50 border border-slate-150 px-1.5 py-0.2 rounded shrink-0">
                            Awaiting
                          </span>
                        );
                      }

                      return (
                        <button
                          key={step.id}
                          onClick={() => setActiveModuleId(step.id)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected 
                              ? 'bg-slate-55 border-slate-300 text-slate-900 shadow-xs ring-1 ring-slate-150' 
                              : 'bg-white border-transparent hover:bg-slate-50 text-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[10px] font-mono font-bold text-gray-400 w-4 block">0{idx + 1}</span>
                            <div className={`p-1.5 rounded-md ${
                              isSelected ? 'bg-[#091540] text-white' : 'bg-slate-100 text-gray-500'
                            }`}>
                              {Icon && <Icon className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-xs font-bold truncate leading-none">{step.name}</span>
                          </div>
                          {statusBadge}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT DETAILS: Selected Module Inspection (lg:col-span-8) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Active Module Panel Wrap */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 min-h-[500px] flex flex-col justify-between">
                  <div>
                    {/* Header Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            Pipeline Module
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {activeModule?.updatedAt ? `Synced ${new Date(activeModule.updatedAt).toLocaleTimeString()}` : 'Not compiled'}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-[#091540] mt-1.5">
                          {PIPELINE_STEPS.find(s => s.id === activeModuleId)?.name}
                        </h3>
                      </div>

                      {activeModule?.status === 'Completed' && (
                        <div className="flex items-center gap-4 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2">
                          <div className="text-right">
                            <span className="text-[8px] uppercase font-bold tracking-wider text-emerald-600 block">Agent Confidence</span>
                            <span className="text-xs font-mono font-black text-emerald-700">{activeModule.confidence}% Verified</span>
                          </div>
                          <div className="h-8 w-8 rounded-full border border-emerald-200 bg-white flex items-center justify-center text-emerald-600">
                            <Lucide.ShieldCheck className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* FAILED STATE CARD */}
                    {activeModule?.status === 'Failed' && (
                      <div className="space-y-6">
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                          <Lucide.AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-rose-900">Module Execution Error</h4>
                            <p className="text-[10px] text-rose-700 mt-1 leading-relaxed">
                              {activeModule.error || 'The research agent encountered an authentication timeout while parsing public database endpoints.'}
                            </p>
                          </div>
                        </div>

                        {/* Debug console section */}
                        <div className="p-4 bg-slate-900 rounded-xl font-mono text-[10px] text-slate-300 space-y-2">
                          <p className="text-rose-400 font-bold">[SYSTEM CRITICAL FAILURE] pipeline_id: {account.id} module: {activeModuleId}</p>
                          <p className="text-slate-500">&gt; Executing: search_scrapers --account="{account.name}" --sec-filings --ttm</p>
                          <p className="text-slate-500">&gt; Querying: public.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=...</p>
                          <p className="text-rose-400">[CONNECTION_TIMEOUT] Access server timed out after 3 retries (3000ms latency maximum exceeded).</p>
                          <p className="text-amber-400">[WARNING] Halting current module execution. Remaining 10 steps will bypass this data.</p>
                        </div>

                        <div className="p-5 border border-slate-150 rounded-xl text-center space-y-3">
                          <p className="text-xs text-gray-500 font-semibold">Ready to re-authenticate or manually force rerun this research crawler?</p>
                          <button
                            onClick={() => rerunSingleModule(account.id, activeModuleId)}
                            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Lucide.RotateCcw className="w-3.5 h-3.5 animate-spin-reverse" />
                            Trigger Dedicated Rerun
                          </button>
                        </div>
                      </div>
                    )}

                    {/* RUNNING STATE CARD */}
                    {activeModule?.status === 'Running' && (
                      <div className="py-16 text-center space-y-4">
                        <Lucide.Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#091540]">AI Agent Active & Compiling</p>
                          <p className="text-[10px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                            Parsing filings, indexing tables, and compiling strategic highlights. Standard completion takes 1.5 seconds.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* NOT STARTED / PENDING */}
                    {(activeModule?.status === 'Pending' || activeModule?.status === 'Not Started' || !activeModule) && (
                      <div className="py-16 text-center text-gray-400 space-y-2">
                        <Lucide.Lock className="w-8 h-8 text-slate-200 mx-auto animate-pulse" />
                        <p className="text-xs font-bold text-gray-700">Module Awaiting Compilation</p>
                        <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                          This module runs sequentially as part of the overall pipeline. Run research or wait for previous steps to finish.
                        </p>
                      </div>
                    )}

                    {/* COMPLETED FINDINGS DISPLAY */}
                    {activeModule?.status === 'Completed' && (() => {
                      if (activeModuleId === 'company' && activeModuleData) {
                        const d = activeModuleData as any;
                        return (
                          <div className="space-y-6 animate-fade-in text-xs">
                            <p className="text-gray-600 leading-relaxed font-semibold">{d.description}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Legal Name</span>
                                <span className="text-sm font-bold text-gray-800 mt-1 block">{d.legalName}</span>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Founded Year</span>
                                <span className="text-sm font-bold text-gray-800 mt-1 block">{d.founded}</span>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Global Headquarters</span>
                                <span className="text-sm font-bold text-gray-800 mt-1 block">{d.headquarters}</span>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Workforce Size</span>
                                <span className="text-sm font-bold text-gray-800 mt-1 block">{d.employees}</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Market Sectors</span>
                              <div className="flex flex-wrap gap-2">
                                {d.sectors?.map((s: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-slate-100 text-gray-600 font-bold rounded-lg border border-slate-150">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Primary Competitors</span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {d.competitors?.map((c: string, idx: number) => (
                                  <div key={idx} className="p-3 border border-slate-200 rounded-lg flex items-center gap-2 bg-white hover:bg-slate-50">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                                    <span className="font-bold text-gray-700 truncate">{c}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (activeModuleId === 'business' && activeModuleData) {
                        const d = activeModuleData as any;
                        return (
                          <div className="space-y-6 animate-fade-in text-xs">
                            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl">
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-2">Market & Competitive Positioning</span>
                              <p className="text-gray-700 leading-relaxed font-semibold italic">"{d.marketPosition}"</p>
                            </div>

                            <div className="space-y-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">SWOT Analysis Matrix</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Strengths */}
                                <div className="p-5 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-3">
                                  <h4 className="font-black text-emerald-800 flex items-center gap-1.5">
                                    <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Strengths
                                  </h4>
                                  <ul className="space-y-2 text-[11px] text-gray-600 font-medium">
                                    {d.swot?.strengths?.map((s: string, i: number) => (
                                      <li key={i} className="flex gap-2 items-start justify-between">
                                        <div className="flex gap-2 items-start min-w-0">
                                          <span className="text-emerald-500 text-[12px] font-bold shrink-0 mt-0.5">•</span>
                                          <span>{s}</span>
                                        </div>
                                        <button
                                          onClick={() => navigate('accounts', account.id, 'evidence')}
                                          className="shrink-0 inline-flex items-center gap-1 bg-emerald-100/70 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/50 rounded px-1.5 py-0.2 text-[9px] font-bold cursor-pointer transition-all"
                                        >
                                          <Lucide.Link className="w-2.5 h-2.5" /> [SEC EDGAR]
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Weaknesses */}
                                <div className="p-5 bg-rose-50/40 border border-rose-100 rounded-xl space-y-3">
                                  <h4 className="font-black text-rose-800 flex items-center gap-1.5">
                                    <Lucide.AlertCircle className="w-4 h-4 text-rose-600" />
                                    Weaknesses
                                  </h4>
                                  <ul className="space-y-2 text-[11px] text-gray-600 font-medium">
                                    {d.swot?.weaknesses?.map((w: string, i: number) => (
                                      <li key={i} className="flex gap-2 items-start justify-between">
                                        <div className="flex gap-2 items-start min-w-0">
                                          <span className="text-rose-500 text-[12px] font-bold shrink-0 mt-0.5">•</span>
                                          <span>{w}</span>
                                        </div>
                                        <button
                                          onClick={() => navigate('accounts', account.id, 'evidence')}
                                          className="shrink-0 inline-flex items-center gap-1 bg-rose-100/70 hover:bg-rose-100 text-rose-800 border border-rose-200/50 rounded px-1.5 py-0.2 text-[9px] font-bold cursor-pointer transition-all"
                                        >
                                          <Lucide.Link className="w-2.5 h-2.5" /> [Audit Scrape]
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Opportunities */}
                                <div className="p-5 bg-blue-50/40 border border-blue-100 rounded-xl space-y-3">
                                  <h4 className="font-black text-blue-800 flex items-center gap-1.5">
                                    <Lucide.Lightbulb className="w-4 h-4 text-blue-600" />
                                    Opportunities
                                  </h4>
                                  <ul className="space-y-2 text-[11px] text-gray-600 font-medium">
                                    {d.swot?.opportunities?.map((o: string, i: number) => (
                                      <li key={i} className="flex gap-2 items-start justify-between">
                                        <div className="flex gap-2 items-start min-w-0">
                                          <span className="text-blue-500 text-[12px] font-bold shrink-0 mt-0.5">•</span>
                                          <span>{o}</span>
                                        </div>
                                        <button
                                          onClick={() => navigate('accounts', account.id, 'evidence')}
                                          className="shrink-0 inline-flex items-center gap-1 bg-blue-100/70 hover:bg-blue-100 text-blue-800 border border-blue-200/50 rounded px-1.5 py-0.2 text-[9px] font-bold cursor-pointer transition-all"
                                        >
                                          <Lucide.Link className="w-2.5 h-2.5" /> [Brief Note]
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Threats */}
                                <div className="p-5 bg-amber-50/40 border border-amber-100 rounded-xl space-y-3">
                                  <h4 className="font-black text-amber-800 flex items-center gap-1.5">
                                    <Lucide.ShieldAlert className="w-4 h-4 text-amber-600" />
                                    Threats
                                  </h4>
                                  <ul className="space-y-2 text-[11px] text-gray-600 font-medium">
                                    {d.swot?.threats?.map((t: string, i: number) => (
                                      <li key={i} className="flex gap-2 items-start justify-between">
                                        <div className="flex gap-2 items-start min-w-0">
                                          <span className="text-amber-500 text-[12px] font-bold shrink-0 mt-0.5">•</span>
                                          <span>{t}</span>
                                        </div>
                                        <button
                                          onClick={() => navigate('accounts', account.id, 'evidence')}
                                          className="shrink-0 inline-flex items-center gap-1 bg-amber-100/70 hover:bg-amber-100 text-amber-800 border border-amber-200/50 rounded px-1.5 py-0.2 text-[9px] font-bold cursor-pointer transition-all"
                                        >
                                          <Lucide.Link className="w-2.5 h-2.5" /> [News Feed]
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                              </div>
                            </div>

                            <div className="space-y-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Key Products & Services</span>
                              <div className="flex flex-wrap gap-2">
                                {d.keyOfferings?.map((o: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-slate-50 text-gray-600 font-semibold rounded-lg border border-slate-150">
                                    {o}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (activeModuleId === 'technology' && activeModuleData) {
                        const d = activeModuleData as any;
                        return (
                          <div className="space-y-6 animate-fade-in text-xs">
                            <p className="text-gray-600 leading-relaxed font-semibold">{d.summary}</p>

                            <div className="space-y-4">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Detected Infrastructure Components</span>
                              <div className="space-y-3">
                                {d.findings?.map((f: any, idx: number) => (
                                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 hover:border-blue-300 hover:shadow-xs transition-all">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-black text-gray-800 text-sm">{f.technology}</span>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                                          {f.category}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                        {f.confidence}% Conf
                                      </span>
                                    </div>

                                    <p className="text-gray-500 leading-relaxed font-medium">
                                      <strong className="text-gray-700">Business Impact:</strong> {f.businessImpact}
                                    </p>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-gray-400">
                                      <span>Evidence Log</span>
                                      <div className="flex gap-2">
                                        {f.evidence?.map((ev: any, i: number) => (
                                          <span key={i} className="flex items-center gap-1">
                                            <span>Source: {ev.source}</span>
                                            <span className="text-[9px] px-1 bg-emerald-50 text-emerald-600 rounded">
                                              {ev.credibility} Trust
                                            </span>
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (activeModuleId === 'news' && activeModuleData) {
                        const d = activeModuleData as any;
                        return (
                          <div className="space-y-6 animate-fade-in text-xs">
                            <div className="space-y-4">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Corporate Announcements</span>
                              <div className="space-y-4">
                                {d.map((item: any) => (
                                  <div key={item.id} className="p-5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <span className="text-[10px] font-mono font-bold text-gray-400">{item.date} • {item.source}</span>
                                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono ${
                                        item.sentiment === 'Positive' 
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                          : item.sentiment === 'Negative'
                                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                          : 'bg-slate-50 text-slate-700 border border-slate-150'
                                      }`}>
                                        {item.sentiment} Sentiment
                                      </span>
                                    </div>

                                    <h4 className="text-sm font-black text-gray-800 leading-snug">{item.title}</h4>

                                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-gray-600 leading-relaxed font-semibold">
                                      <strong className="text-gray-700 block text-[10px] uppercase font-black tracking-wider mb-1">Impact on Intellify Positioning</strong>
                                      {item.impact}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (activeModuleId === 'hiring' && activeModuleData) {
                        const d = activeModuleData as any;
                        return (
                          <div className="space-y-6 animate-fade-in text-xs">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl sm:col-span-1 text-center flex flex-col justify-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Open Positions</span>
                                <span className="text-2xl font-black text-[#091540] font-mono mt-1 block">{d.openRoleCount}</span>
                                <span className="text-[9px] text-gray-400 mt-1 block">Active Postings</span>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl sm:col-span-2 space-y-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Primary Focus Areas</span>
                                <ul className="space-y-1.5 font-bold text-gray-600">
                                  {d.focusAreas?.map((f: string, i: number) => (
                                    <li key={i} className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Demanded Skills (High Concentration)</span>
                              <div className="flex flex-wrap gap-2">
                                {d.skillsInDemand?.map((s: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 font-black rounded-lg border border-blue-100">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Recruitment Trends Analysis</span>
                              <div className="space-y-2 text-gray-600 leading-relaxed font-semibold">
                                {d.trends?.map((t: string, i: number) => (
                                  <p key={i} className="p-3 bg-white border border-slate-150 rounded-xl flex gap-3">
                                    <Lucide.Briefcase className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                    <span>{t}</span>
                                  </p>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-gray-400">
                              <span>Crawler Verifications</span>
                              {d.evidence?.map((ev: any, idx: number) => (
                                <span key={idx} className="bg-slate-50 px-2 py-0.5 rounded">Indexed from: {ev.source}</span>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (activeModuleId === 'financial' && activeModuleData) {
                        const d = activeModuleData as any;
                        return (
                          <div className="space-y-6 animate-fade-in text-xs">
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">TTM Revenue</span>
                                <span className="text-base font-black text-[#091540] font-mono mt-1 block">{d.revenue}</span>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Net Income</span>
                                <span className="text-base font-black text-[#091540] font-mono mt-1 block">{d.netIncome}</span>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Growth Rate</span>
                                <span className="text-base font-black text-emerald-600 font-mono mt-1 block">{d.growthRate}</span>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Annual R&D Spend</span>
                                <span className="text-base font-black text-[#091540] font-mono mt-1 block">{d.rdSpend}</span>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl col-span-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Est. Digital Transformation Budget</span>
                                <span className="text-base font-black text-blue-600 mt-1 block">{d.digitalBudgetEst}</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Siloed Segment Metrics</span>
                              <div className="space-y-2">
                                {d.metrics?.map((m: any, idx: number) => (
                                  <div key={idx} className="p-3 border border-slate-200 rounded-lg flex justify-between items-center bg-white">
                                    <span className="font-bold text-gray-700">{m.metric}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-black text-gray-800">{m.value}</span>
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                                        m.trend === 'Up' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                                      }`}>
                                        {m.trend === 'Up' ? '▲ Upward' : '▬ Flat'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (activeModuleId === 'strategic' && activeModuleData) {
                        const d = activeModuleData as any;
                        return (
                          <div className="space-y-6 animate-fade-in text-xs">
                            <div className="space-y-4">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Corporate Objectives</span>
                              <div className="space-y-4">
                                {d.map((p: any, idx: number) => (
                                  <div key={idx} className="p-5 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-all space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="h-5 w-5 rounded-full bg-[#091540] text-white flex items-center justify-center font-bold text-[10px]">
                                          {idx + 1}
                                        </span>
                                        <h4 className="font-black text-gray-900 text-sm">{p.priority}</h4>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono ${
                                        p.impactLevel === 'High' 
                                          ? 'bg-rose-50 text-rose-700' 
                                          : 'bg-blue-50 text-blue-700'
                                      }`}>
                                        {p.impactLevel} Impact
                                      </span>
                                    </div>

                                    <p className="text-gray-500 leading-relaxed font-semibold pl-7">{p.details}</p>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-gray-400 pl-7">
                                      <span>Execution Pipeline: <strong className="text-slate-700">{p.timeline}</strong></span>
                                      {p.evidence?.map((ev: any, i: number) => (
                                        <span key={i}>Verified: {ev.source}</span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (activeModuleId === 'signals' && activeModuleData) {
                        const d = activeModuleData as any;
                        return (
                          <div className="space-y-6 animate-fade-in text-xs">
                            {/* Live Signal Radar Banner */}
                            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-50 to-blue-50/20 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="p-1 rounded bg-amber-500 text-white">
                                    <Lucide.Radio className="w-3.5 h-3.5 animate-pulse" />
                                  </span>
                                  <span className="font-bold text-xs text-[#091540]">Real-Time Signal Radar Active</span>
                                  <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                    Live Telemetry
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  Discovered signals automatically dispatch priority alerts to <span className="font-semibold text-slate-700">{account.owner.split('(')[0].trim()}</span>, <span className="font-semibold text-slate-700">mahesh@intellifysolutions.com</span>, and <span className="font-semibold text-slate-700">srini@intellifysolutions.com</span>.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowSignalsModal(true)}
                                className="px-3.5 py-2 bg-[#091540] hover:bg-[#15276e] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                              >
                                <Lucide.RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                                <span>Refresh Signals & Notify</span>
                              </button>
                            </div>

                            <div className="space-y-4">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Friction Triggers & Intent Signals</span>
                              <div className="space-y-4">
                                {d.map((s: any, idx: number) => (
                                  <div key={idx} className="p-5 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-all space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5">
                                        <Lucide.Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        <span className="font-black text-gray-800 text-sm">Intent Highlight</span>
                                      </div>
                                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono ${
                                        s.urgency === 'Immediate' 
                                          ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                                      }`}>
                                        {s.urgency} Action
                                      </span>
                                    </div>

                                    <p className="text-gray-800 leading-relaxed font-bold text-xs">
                                      "{s.signal}"
                                    </p>

                                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-gray-600 font-semibold leading-relaxed">
                                      <strong className="text-gray-700 text-[10px] uppercase font-black tracking-wider block mb-1">Recommended Engagement Vector</strong>
                                      {s.businessImpact}
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-gray-400">
                                      <span>Urgency Index: {s.confidence}% Confident</span>
                                      {s.evidence?.map((ev: any, i: number) => (
                                        <span key={i}>Validated: {ev.source}</span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (activeModuleId === 'maturity' && activeModuleData) {
                        const d = activeModuleData as any;
                        return (
                          <div className="space-y-6 animate-fade-in text-xs">
                            
                            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-blue-50/20 border border-slate-150 rounded-xl gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Assessed Infrastructure Profile</span>
                                <p className="text-sm font-black text-gray-800">Overall Digital Maturity Score</p>
                              </div>
                              <span className="text-2xl font-black text-[#091540] font-mono shrink-0 bg-white border border-slate-200 h-14 w-14 rounded-full flex items-center justify-center shadow-xs">
                                {d.overall}%
                              </span>
                            </div>

                            <p className="text-gray-600 leading-relaxed font-semibold italic p-4 bg-white border border-slate-150 rounded-xl">
                              "{d.assessment}"
                            </p>

                            <div className="space-y-4 pt-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Category Capability Audit</span>
                              <div className="space-y-3.5">
                                {[
                                  { label: 'Cloud Infrastructure Adoption', key: 'cloud', value: d.scores?.cloud || 80 },
                                  { label: 'AI & Data-Science Practices', key: 'ai', value: d.scores?.ai || 60 },
                                  { label: 'Central Analytics & Data Platform', key: 'dataPlatform', value: d.scores?.dataPlatform || 70 },
                                  { label: 'Security & HIPAA Compliance', key: 'security', value: d.scores?.security || 90 },
                                  { label: 'CI/CD & DevOps Automation', key: 'devops', value: d.scores?.devops || 75 },
                                ].map((score) => (
                                  <div key={score.key} className="space-y-1.5">
                                    <div className="flex justify-between font-bold text-[10.5px]">
                                      <span className="text-gray-700">{score.label}</span>
                                      <span className="text-[#091540] font-mono">{score.value}%</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000" 
                                        style={{ width: `${score.value}%` }} 
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (activeModuleId === 'opportunities' && activeModuleData) {
                        const d = activeModuleData as any;
                        return (
                          <div className="space-y-6 animate-fade-in text-xs">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">High-Value Custom Service Proposals</span>
                            <div className="space-y-5">
                              {d.map((opp: any, idx: number) => (
                                <div key={idx} className="p-6 border border-slate-200 bg-slate-50/30 rounded-xl hover:border-slate-350 transition-all space-y-4">
                                  
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 pb-3">
                                    <div>
                                      <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                                        Opportunity Proposal
                                      </span>
                                      <h4 className="text-sm font-black text-gray-900 mt-1">{opp.opportunity}</h4>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0">
                                      <span className="text-[9px] uppercase font-bold text-gray-400 block font-mono">Commercial Value</span>
                                      <span className="text-sm font-black text-emerald-600 font-mono">{opp.estimatedBusinessValue}</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-3.5 bg-white border border-slate-150 rounded-xl space-y-1">
                                      <span className="text-[9px] font-bold uppercase text-gray-400 font-mono block">Recommended Offering</span>
                                      <span className="font-black text-slate-800">{opp.recommendedOffering}</span>
                                    </div>
                                    <div className="p-3.5 bg-white border border-slate-150 rounded-xl space-y-1">
                                      <span className="text-[9px] font-bold uppercase text-gray-400 font-mono block">Intellify Accelerator</span>
                                      <span className="font-black text-slate-800">{opp.suggestedAccelerator}</span>
                                    </div>
                                    <div className="p-3.5 bg-white border border-slate-150 rounded-xl col-span-1 sm:col-span-2 space-y-1">
                                      <span className="text-[9px] font-bold uppercase text-gray-400 font-mono block">Syllabus Workshop Pilot</span>
                                      <span className="font-semibold text-slate-700">{opp.suggestedWorkshop}</span>
                                    </div>
                                  </div>

                                  {/* DISCOVERY QUESTIONS BOX: Ultra important prompt requirement */}
                                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                                    <h5 className="font-black text-[#091540] text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                                      <Lucide.HelpCircle className="w-4 h-4 text-blue-500" />
                                      Suggested Executive Discovery Questions
                                    </h5>
                                    <ul className="space-y-2 text-[10.5px] text-gray-600 font-medium">
                                      {opp.suggestedDiscoveryQuestions?.map((q: string, i: number) => (
                                        <li key={i} className="flex gap-2 items-start leading-relaxed p-2 bg-slate-50 border border-slate-100 rounded-lg">
                                          <span className="text-blue-500 font-black font-mono shrink-0">Q{i + 1}:</span>
                                          <span className="font-bold">"{q}"</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (activeModuleId === 'executive' && activeModuleData) {
                        const d = activeModuleData as any;
                        return (
                          <div className="space-y-6 animate-fade-in text-xs">
                            
                            <div className="p-5 bg-gradient-to-r from-[#091540] to-[#14266b] rounded-xl text-white space-y-2">
                              <span className="text-[10px] uppercase tracking-widest font-black text-blue-400 font-mono">Consolidated Positioning Strategy</span>
                              <p className="text-[12.5px] font-semibold leading-relaxed">
                                {d.recommendedStrategy}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-slate-150 pb-1.5">Core Business profile</span>
                                <p className="text-gray-600 leading-relaxed font-semibold">{d.businessSummary}</p>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-slate-150 pb-1.5">Infrastructure Landscape</span>
                                <p className="text-gray-600 leading-relaxed font-semibold">{d.technologySummary}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Key Risks / Friction</span>
                                <ul className="space-y-1.5 font-bold text-gray-600">
                                  {d.keyRisks?.map((r: string, i: number) => (
                                    <li key={i} className="flex gap-1.5 items-start">
                                      <span className="text-amber-500 shrink-0 mt-1">•</span>
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Key Opportunities</span>
                                <ul className="space-y-1.5 font-bold text-gray-600">
                                  {d.keyOpportunities?.map((o: string, i: number) => (
                                    <li key={i} className="flex gap-1.5 items-start">
                                      <span className="text-blue-500 shrink-0 mt-1">•</span>
                                      <span>{o}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Active Initiatives</span>
                                <ul className="space-y-1.5 font-bold text-gray-600">
                                  {d.currentInitiatives?.map((in_val: string, i: number) => (
                                    <li key={i} className="flex gap-1.5 items-start">
                                      <span className="text-emerald-500 shrink-0 mt-1">•</span>
                                      <span>{in_val}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="space-y-3 pt-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Recommended Intellify Services</span>
                              <div className="flex flex-wrap gap-2">
                                {d.recommendedIntellifyServices?.map((srv: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1.5 bg-[#091540] text-white font-bold rounded-lg text-[10.5px]">
                                    {srv}
                                  </span>
                                ))}
                              </div>
                            </div>

                          </div>
                        );
                      }

                      return (
                        <div className="text-center py-12 text-gray-400">
                          <p className="text-xs">No template findings parsed for this module id.</p>
                        </div>
                      );
                    })()}

                  </div>

                  {/* Execution Log summary footer inside active module details */}
                  {activeModule?.status === 'Completed' && (
                    <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Lucide.Terminal className="w-3.5 h-3.5 text-slate-400" />
                        <span>Execution Trace: <strong className="text-slate-600">Agent_{activeModuleId}_crawler.py</strong> successfully finished execution with status 0.</span>
                      </div>
                      <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                        LATENCY: 420ms
                      </span>
                    </div>
                  )}

                </div>

              </div>

            </div>
          );
        })()}

        {/* ======================================================== EVIDENCE TAB */}
        {currentDetailSubTab === 'evidence' && (
          <EvidenceCollectionEngine account={account} />
        )}

        {/* ======================================================== DOCUMENTS TAB */}
        {currentDetailSubTab === 'documents' && (
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 sm:p-8 animate-fade-in">
            <h3 className="text-base font-bold text-[#091540] mb-2">Account Briefs & Document Repository</h3>
            <p className="text-xs text-gray-400 mb-6 max-w-2xl leading-relaxed">
              Upload strategic reference documentation such as peer analysis files, corporate briefing papers, or pitch decks.
            </p>
            <FileUploader
              id="details-uploader"
              documents={accountDocuments}
              onUpload={(file) => uploadDocument(account.id, file)}
              onDelete={deleteDocument}
            />
          </div>
        )}

        {/* ======================================================== STAKEHOLDERS TAB */}
        {currentDetailSubTab === 'stakeholders' && (
          selectedStakeholderId ? (
            <StakeholderIntelligence
              stakeholder={stakeholders.find(s => s.id === selectedStakeholderId)!}
              account={account}
              companyResearch={research}
              allAccountStakeholders={accountStakeholders}
              onBack={() => setSelectedStakeholderId(null)}
              onResearch={researchStakeholder}
              onUpdateStakeholder={updateStakeholder}
            />
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#091540]">Key Stakeholders & Buying Center</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xl">
                    Map decision-makers, champions, and tech sponsors to track account reach. Click any contact to compile AI profile intelligence.
                  </p>
                </div>
                <button
                  onClick={() => setShowStakeholderModal(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#091540] hover:bg-[#15276e] rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Lucide.UserPlus className="w-3.5 h-3.5" />
                  Add Contact
                </button>
              </div>

              {/* Stakeholder Table */}
              {accountStakeholders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
                  <Lucide.Users2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">No stakeholders registered</p>
                  <p className="text-[10px] text-gray-400 mt-1">Add key corporate leads, or wait for AI discovery tools.</p>
                  <button
                    onClick={() => setShowStakeholderModal(true)}
                    className="mt-4 px-4 py-1.5 text-xs font-semibold text-[#091540] border border-[#091540]/20 hover:bg-slate-50 rounded-lg"
                  >
                    Add Stakeholder Contact
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/70 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Department</th>
                          <th className="px-6 py-4">LinkedIn</th>
                          <th className="px-6 py-4 text-center">Buying Center Role</th>
                          <th className="px-6 py-4 text-center">Organizational Influence</th>
                          <th className="px-6 py-4 text-center">Reach Status</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                        {accountStakeholders.map((stk) => (
                          <tr 
                            key={stk.id} 
                            className="hover:bg-slate-50/50 cursor-pointer transition-all duration-150"
                            onClick={() => setSelectedStakeholderId(stk.id)}
                          >
                            {/* Name + Title */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#091540] text-xs shrink-0 uppercase border border-gray-200">
                                  {stk.name.slice(0, 2)}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 hover:text-blue-600 transition-colors">{stk.name}</p>
                                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">{stk.title}</p>
                                </div>
                              </div>
                            </td>

                            {/* Department */}
                            <td className="px-6 py-4 text-gray-500">{stk.department}</td>

                            {/* LinkedIn link */}
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <a
                                href={stk.linkedIn}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                              >
                                <Lucide.Linkedin className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Profile</span>
                              </a>
                            </td>

                            {/* Role */}
                            <td className="px-6 py-4 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-gray-600 border border-slate-100">
                                {stk.role}
                              </span>
                            </td>

                            {/* Influence */}
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                stk.influence === 'High' 
                                  ? 'text-rose-700 bg-rose-50' 
                                  : stk.influence === 'Medium' 
                                  ? 'text-amber-700 bg-amber-50' 
                                  : 'text-slate-600 bg-slate-100'
                              }`}>
                                {stk.influence} Influence
                              </span>
                            </td>

                            {/* Contact status */}
                            <td className="px-6 py-4 text-center">
                              <StatusBadge id={`stk-status-${stk.id}`} type="stakeholder" value={stk.status} />
                            </td>

                            {/* Action Buttons */}
                            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedStakeholderId(stk.id)}
                                  className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-slate-50"
                                  title="Analyze Profile"
                                >
                                  <Lucide.Cpu className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Remove ${stk.name} from target stake mapping?`)) {
                                      deleteStakeholder(stk.id);
                                    }
                                  }}
                                  className="text-gray-400 hover:text-rose-600 p-1 rounded hover:bg-slate-50"
                                  title="Delete Contact"
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
            </div>
          )
        )}

        {/* ======================================================== OPPORTUNITIES TAB */}
        {currentDetailSubTab === 'opportunities' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#091540]">Potential Co-Innovation Opportunities</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xl">
                  Construct targeted pilot proposals based on compiled organizational friction.
                </p>
              </div>
              <button
                onClick={() => setShowOpportunityModal(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#091540] hover:bg-[#15276e] rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Lucide.PlusCircle className="w-3.5 h-3.5" />
                Register Opportunity
              </button>
            </div>

            {/* Grid display */}
            {accountOpportunities.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
                <Lucide.TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-bold text-gray-700">No active opportunities defined</p>
                <p className="text-[10px] text-gray-400 mt-1">Run AI mapping or configure custom service accelerators.</p>
                <button
                  onClick={() => setShowOpportunityModal(true)}
                  className="mt-4 px-4 py-1.5 text-xs font-semibold text-[#091540] border border-[#091540]/20 hover:bg-slate-50 rounded-lg"
                >
                  Create Custom Opportunity
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {accountOpportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    id={`detail-opp-${opp.id}`}
                    opportunity={opp}
                    onDelete={deleteOpportunity}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== ENGAGE & COMMS TAB */}
        {currentDetailSubTab === 'communication' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header explanation block */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="text-sm font-bold text-[#091540] flex items-center gap-2">
                <Lucide.Compass className="w-4.5 h-4.5 text-[#2563FF]" />
                Interactive Client Alignment Generator
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 max-w-3xl leading-relaxed font-semibold">
                This workbench personalizes email, discovery scripts, and meeting schedules based on compiled organizational friction.
                {account.researchStatus !== 'Completed' && (
                  <span className="text-rose-600 block mt-1 font-bold">
                    ⚠️ Research must be set to 'Completed' to synthesize fully personalized briefing materials.
                  </span>
                )}
              </p>
            </div>

            {/* Mapped templates */}
            {account.researchStatus !== 'Completed' ? (
              <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
                <Lucide.MailOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">AI Personalization Unavailable</p>
                <p className="text-[10px] text-gray-400 mt-1 mb-4">Complete research to auto-generate personalized cold emails, discovery briefs, and agendas.</p>
                <button
                  onClick={() => triggerResearch(account.id, account.researchDepth)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#091540] hover:bg-[#1a2d7c] rounded-lg shadow-sm"
                >
                  Start Research Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left hand list of engagement categories */}
                <div className="lg:col-span-1 space-y-3">
                  {[
                    { key: 'email', label: 'Cold Outreach Pitch', desc: 'Enterprise-aligned email pitch for Judson Althoff.', icon: 'MailOpen' },
                    { key: 'linkedin', label: 'InMail Short Frame', desc: 'Brief conversational LinkedIn frame.', icon: 'Linkedin' },
                    { key: 'agenda', label: 'Co-Innovation Workshop', desc: '2-hour customized alignment schedule.', icon: 'Presentation' },
                    { key: 'discovery', label: 'Discovery Question Stack', desc: 'Pre-mapped diagnostic script.', icon: 'HelpCircle' }
                  ].map((com, i) => {
                    const Icon = Lucide[com.icon as keyof typeof Lucide] as React.ComponentType<{ className?: string }>;
                    return (
                      <div
                        key={i}
                        className="p-4 bg-white hover:bg-slate-50 border border-gray-100 rounded-xl cursor-pointer shadow-xs hover:border-blue-200 transition-all flex items-start gap-3"
                      >
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          {Icon && <Icon className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-900">{com.label}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-medium line-clamp-1">{com.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right hand interactive preview panel */}
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-150 rounded-xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-[#2563FF] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                          AI Formulated Outreach
                        </span>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mt-2">Personalized Draft Preview</h4>
                      </div>
                      <button
                        onClick={() => alert('Template text copied to clip board')}
                        className="px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Lucide.Copy className="w-3 h-3" />
                        Copy Text
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 max-h-[350px] overflow-y-auto">
                      <pre className="text-xs font-mono font-medium text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {`Subject: Co-Innovating on GenAI: Accelerating ${account.name}'s Strategic Roadmap

Dear Judson Althoff,

I recently reviewed your strategic priorities for scaling enterprise AI adoption through Microsoft Cloud, and it is clear that ${account.name} is leading the frontier in driving enterprise digitization.

At Intellify, we specialize in high-impact AI accelerators that align directly with ${account.industry} leaders. Specifically, we see a massive opportunity for ${account.name} to leverage our pre-built modules for Cross-Industry GenAI Advisory which would address current challenges in high compute costs of running state-of-the-art LLMs.

We have compiled a briefing paper mapping our capabilities specifically to your current initiatives. Do you have 15 minutes next Tuesday at 10:00 AM CST for a brief introductory discussion?

Sincerely,

${account.owner}
Intellify Account Intelligence`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== ACTIVITY LOGS TAB */}
        {currentDetailSubTab === 'activity' && (
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 sm:p-8 animate-fade-in">
            <h3 className="text-base font-bold text-[#091540] mb-1">Operational Audit Logs</h3>
            <p className="text-xs text-gray-400 mb-6">Historical trail of modifications and intelligence triggers for this target.</p>
            
            <div className="max-w-2xl">
              <Timeline id="details-tab-timeline" activities={accountActivities} />
            </div>
          </div>
        )}
      </div>

      {/* ========================================== MODALS SECTION */}
      
      {/* 1. STAKEHOLDER MODAL */}
      {showStakeholderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-extrabold text-[#091540]">Add Account Stakeholder</h3>
              <button 
                onClick={() => setShowStakeholderModal(false)}
                className="p-1 hover:bg-slate-200 text-gray-400 hover:text-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <Lucide.X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Method Toggle */}
            <div className="p-6 pb-2">
              <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/50">
                <button
                  type="button"
                  onClick={() => setStkForm(prev => ({ ...prev, inputMethod: 'linkedin' }))}
                  className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
                    stkForm.inputMethod === 'linkedin'
                      ? 'bg-white text-[#091540] shadow-2xs border border-gray-200/40'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Method 1: LinkedIn URL Analysis
                </button>
                <button
                  type="button"
                  onClick={() => setStkForm(prev => ({ ...prev, inputMethod: 'manual' }))}
                  className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
                    stkForm.inputMethod === 'manual'
                      ? 'bg-white text-[#091540] shadow-2xs border border-gray-200/40'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Method 2: Manual Entry
                </button>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-4 max-h-[480px] overflow-y-auto">
              {stkForm.inputMethod === 'linkedin' ? (
                <div className="space-y-4 animate-fade-in">
                  {/* LinkedIn URL */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">LinkedIn Profile URL *</label>
                    <input
                      type="url"
                      placeholder="e.g. https://linkedin.com/in/satyanadella"
                      required
                      value={stkForm.linkedIn}
                      onChange={(e) => setStkForm(prev => ({ ...prev, linkedIn: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-medium text-gray-800"
                    />
                  </div>

                  {/* Name fields for basic parsing fallback */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">First Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Satya"
                        required
                        value={stkForm.firstName}
                        onChange={(e) => setStkForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-medium text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Last Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Nadella"
                        required
                        value={stkForm.lastName}
                        onChange={(e) => setStkForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-medium text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Title & Department */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Job Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Chief Executive Officer"
                        required
                        value={stkForm.title}
                        onChange={(e) => setStkForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-medium text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Department</label>
                      <select
                        value={stkForm.department}
                        onChange={(e) => setStkForm(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-semibold text-gray-600"
                      >
                        <option value="Executive Office">Executive Office (C-Suite)</option>
                        <option value="IT & Engineering">IT & Engineering</option>
                        <option value="Sales & Business Dev">Sales & Business Dev</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Finance & Procurement">Finance & Procurement</option>
                        <option value="Human Resources">Human Resources</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {/* Name Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">First Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Satya"
                        required
                        value={stkForm.firstName}
                        onChange={(e) => setStkForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-medium text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Last Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Nadella"
                        required
                        value={stkForm.lastName}
                        onChange={(e) => setStkForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-medium text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Title & Email */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Job Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Director of Infrastructure"
                        required
                        value={stkForm.title}
                        onChange={(e) => setStkForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-medium text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. satya@microsoft.com"
                        value={stkForm.email}
                        onChange={(e) => setStkForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-medium text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Department & Company */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Department</label>
                      <select
                        value={stkForm.department}
                        onChange={(e) => setStkForm(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-semibold text-gray-600"
                      >
                        <option value="Executive Office">Executive Office (C-Suite)</option>
                        <option value="IT & Engineering">IT & Engineering</option>
                        <option value="Sales & Business Dev">Sales & Business Dev</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Finance & Procurement">Finance & Procurement</option>
                        <option value="Human Resources">Human Resources</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Company</label>
                      <input
                        type="text"
                        value={stkForm.company}
                        onChange={(e) => setStkForm(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-semibold text-gray-600 bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">LinkedIn URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://linkedin.com/in/username"
                      value={stkForm.linkedIn}
                      onChange={(e) => setStkForm(prev => ({ ...prev, linkedIn: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-medium text-gray-800"
                    />
                  </div>
                </div>
              )}

              {/* Role, Influence, Status */}
              <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Role</label>
                  <select
                    value={stkForm.role}
                    onChange={(e) => setStkForm(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-semibold text-gray-600"
                  >
                    <option value="Decision Maker">Decision Maker</option>
                    <option value="Influencer">Influencer</option>
                    <option value="Champion">Champion</option>
                    <option value="Gatekeeper">Gatekeeper</option>
                    <option value="End User">End User</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Influence</label>
                  <select
                    value={stkForm.influence}
                    onChange={(e) => setStkForm(prev => ({ ...prev, influence: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-semibold text-gray-600"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Reach Status</label>
                  <select
                    value={stkForm.status}
                    onChange={(e) => setStkForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-semibold text-gray-600"
                  >
                    <option value="Active">Active</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Engaged">Engaged</option>
                    <option value="No Contact">No Contact</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Background Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Met at partner event. Receptive to data mesh advisory."
                  value={stkForm.notes}
                  onChange={(e) => setStkForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#091540] outline-hidden font-medium text-gray-800"
                ></textarea>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => setShowStakeholderModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-slate-100 rounded-lg border border-gray-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveContact(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all shadow-2xs cursor-pointer"
                >
                  Save Basic
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveContact(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#091540] hover:bg-[#15276e] rounded-lg transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Lucide.Cpu className="w-3.5 h-3.5" />
                  Save & Run AI Research
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OPPORTUNITY MODAL */}
      {showOpportunityModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-[#091540]">Register Custom Opportunity</h3>
              <button 
                onClick={() => setShowOpportunityModal(false)}
                className="p-1 hover:bg-slate-200 text-gray-400 hover:text-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <Lucide.X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOpportunitySubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Automated Marketing Pilot"
                  required
                  value={oppForm.title}
                  onChange={(e) => setOppForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-medium text-gray-800"
                />
              </div>

              {/* Service Accelerator */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Service Type Accelerator</label>
                <select
                  value={oppForm.service}
                  onChange={(e) => setOppForm(prev => ({ ...prev, service: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-semibold text-gray-600"
                >
                  <option value="Enterprise Strategy Consulting">Enterprise Strategy Consulting</option>
                  <option value="Advanced Solutions Development">Advanced Solutions Development</option>
                  <option value="Rapid Prototyping & Development">Rapid Prototyping & Development</option>
                  <option value="AI Integration & Tuning Workshop">AI Integration & Tuning Workshop</option>
                  <option value="Proof of Value (PoV) Sandbox">Proof of Value (PoV) Sandbox</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Technical Alignment Scope *</label>
                <textarea
                  placeholder="Provide brief details on what problem we are solving and what pilot Intellify is proposing..."
                  required
                  rows={3}
                  value={oppForm.description}
                  onChange={(e) => setOppForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-medium text-gray-800 leading-normal resize-none"
                />
              </div>

              {/* Value and Probability */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Contract Valuation *</label>
                  <input
                    type="text"
                    placeholder="e.g. $250,000"
                    required
                    value={oppForm.value}
                    onChange={(e) => setOppForm(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-medium text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={oppForm.probability}
                    onChange={(e) => setOppForm(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-medium text-gray-800 font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOpportunityModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-slate-50 rounded-lg border border-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#091540] hover:bg-[#1a2d7c] rounded-lg shadow-sm cursor-pointer"
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Account Modal */}
      <ShareAccountModal 
        account={account} 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
      />

      {/* Signals Refresh & Notification Modal */}
      <SignalsRefreshModal
        isOpen={showSignalsModal}
        onClose={() => setShowSignalsModal(false)}
        targetAccountId={account.id}
      />

    </div>
  );
};
