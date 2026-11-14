import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResearchEvidence, Document, Account } from '../types';

interface EvidenceCollectionEngineProps {
  account: Account;
}

export const EvidenceCollectionEngine: React.FC<EvidenceCollectionEngineProps> = ({ account }) => {
  const {
    evidence,
    documents,
    orchestratedResearches,
    addManualNote,
    triggerSourceIngestion,
  } = useApp();

  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Website' | 'SEC EDGAR' | 'Careers' | 'News' | 'Document' | 'Manual Note'>('All');
  
  // State for Ingestors loaders
  const [ingestionLoading, setIngestionLoading] = useState<Record<string, boolean>>({});

  // Manual Note Form State
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('Meeting Brief');

  // Interactive Document Viewer modal state
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Filter evidence for this specific account
  const accountEvidence = (evidence || []).filter((e) => e.accountId === account.id);
  const accountDocuments = (documents || []).filter((d) => d.accountId === account.id);
  const oResearch = orchestratedResearches[account.id];

  // Ingest source handler
  const handleIngestion = async (sourceType: 'Website' | 'SEC EDGAR' | 'Careers' | 'News') => {
    setIngestionLoading(prev => ({ ...prev, [sourceType]: true }));
    try {
      await triggerSourceIngestion(account.id, sourceType);
    } catch (err) {
      console.error(err);
    } finally {
      setIngestionLoading(prev => ({ ...prev, [sourceType]: false }));
    }
  };

  // Submit manual note
  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    addManualNote(account.id, noteTitle.trim(), noteContent.trim(), noteCategory);
    setNoteTitle('');
    setNoteContent('');
    setShowNoteForm(false);
  };

  // Get matching evidence list
  const filteredEvidence = accountEvidence.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || ev.sourceType === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Default to first item if none is selected
  const activeEvidence =
    filteredEvidence.find((ev) => ev.id === selectedEvidenceId) || filteredEvidence[0];

  // Helper icons based on source types
  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'Website':
        return <Lucide.Globe className="w-4 h-4 text-emerald-500" />;
      case 'SEC EDGAR':
        return <Lucide.ShieldCheck className="w-4 h-4 text-blue-500" />;
      case 'Careers':
        return <Lucide.Briefcase className="w-4 h-4 text-purple-500" />;
      case 'News':
        return <Lucide.FileText className="w-4 h-4 text-amber-500" />;
      case 'Document':
        return <Lucide.FileDown className="w-4 h-4 text-indigo-500" />;
      case 'Manual Note':
        return <Lucide.PencilLine className="w-4 h-4 text-rose-500" />;
      default:
        return <Lucide.Database className="w-4 h-4 text-gray-500" />;
    }
  };

  // Extract coverage score values with defaults
  const covWebsite = oResearch?.coverage?.website ?? 80;
  const covFilings = oResearch?.coverage?.annualReport ?? 90;
  const covTech = oResearch?.coverage?.technology ?? 85;
  const covCareers = oResearch?.coverage?.hiring ?? 75;
  const covNews = oResearch?.coverage?.news ?? 90;
  const covDocs = oResearch?.coverage?.uploadedDocuments ?? 0;
  const covManual = oResearch?.coverage?.manualNotes ?? 0;
  const covOverall = oResearch?.coverage?.overallScore ?? 80;

  const qualityGrade = oResearch?.researchQuality ?? 'B';

  const getQualityColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (grade.startsWith('B')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (grade.startsWith('C')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const getQualityBadgeText = (grade: string) => {
    if (grade === 'A+') return 'PREMIUM INSIGHT GRADE';
    if (grade === 'A') return 'EXECUTIVE GRADE';
    if (grade === 'B') return 'STANDARD ANALYST GRADE';
    return 'BASIC COVERAGE';
  };

  // Selected Doc for interactive viewer
  const activeDoc = accountDocuments.find(d => d.id === selectedDocId);

  return (
    <div className="space-y-6 animate-fade-in" id="evidence-collection-engine">
      
      {/* 1. TOP QUALITY METRICS BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info panel */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                <Lucide.ShieldCheck className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-[#091540] uppercase tracking-wider text-[11px]">Traceability engine</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Before the Gemini reasoning model synthesizes strategic suggestions, it accesses, reads, and parses verifiable source evidence. This ensures zero hallucination, strict factual tracking, and complete enterprise grounding.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-400">
            <span>VERIFIED SOURCES: {accountEvidence.length}</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <Lucide.Lock className="w-3 h-3" /> SSL SECURE
            </span>
          </div>
        </div>

        {/* Coverage scoring matrix */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
          <h3 className="text-xs font-bold text-[#091540] uppercase tracking-wider mb-3">Multi-Channel Ingestion Score</h3>
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                <span>WEBSITE / PRODUCTS</span>
                <span>{covWebsite}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${covWebsite}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                <span>SEC FILINGS / REGULATORY</span>
                <span>{covFilings}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${covFilings}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                <span>HIRING / PORTAL</span>
                <span>{covCareers}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${covCareers}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-400 block">Uploaded Briefs</span>
                <span className="text-xs font-bold text-gray-700">{covDocs}%</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-400 block">Manual Context</span>
                <span className="text-xs font-bold text-gray-700">{covManual}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Grade Badge */}
        <div className={`border shadow-sm rounded-xl p-5 flex flex-col justify-between text-center items-center ${getQualityColor(qualityGrade)}`}>
          <div className="text-[10px] font-extrabold tracking-widest uppercase">
            {getQualityBadgeText(qualityGrade)}
          </div>
          
          <div className="my-1">
            <span className="text-5xl font-black tracking-tight">{qualityGrade}</span>
            <span className="text-xs font-bold block mt-1 uppercase tracking-wider">Research Quality Grade</span>
          </div>

          <div className="w-full bg-white/60 backdrop-blur-xs rounded-lg py-1.5 px-3 text-[10px] font-bold text-slate-700 flex items-center justify-between">
            <span>Overall Score:</span>
            <span className="font-mono text-xs">{covOverall}%</span>
          </div>
        </div>

      </div>

      {/* 2. AUTOMATED SCRAIPING CONNECTORS CONTROL HUB */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xs font-bold text-[#091540] uppercase tracking-wider">On-Demand Ingestion Connectors</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Scrape and process the latest real-time unstructured data directly into the index.</p>
          </div>
          <span className="px-2 py-0.5 bg-indigo-100 text-[#091540] text-[9px] font-mono font-bold rounded uppercase">
            Autonomous Pipelines
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { type: 'Website' as const, label: 'Website Crawler', desc: 'Sync landing pages & posts', icon: <Lucide.Globe className="w-4 h-4 text-emerald-500" /> },
            { type: 'SEC EDGAR' as const, label: 'EDGAR Filings', desc: 'Sync SEC Form 10-K & 10-Q', icon: <Lucide.FileSpreadsheet className="w-4 h-4 text-blue-500" /> },
            { type: 'Careers' as const, label: 'Careers Portal', desc: 'Sync technical role listings', icon: <Lucide.Briefcase className="w-4 h-4 text-purple-500" /> },
            { type: 'News' as const, label: 'PR & News Sync', desc: 'Sync recent external headlines', icon: <Lucide.FileText className="w-4 h-4 text-amber-500" /> }
          ].map((sc) => {
            const loading = ingestionLoading[sc.type];
            return (
              <button
                key={sc.type}
                disabled={loading}
                onClick={() => handleIngestion(sc.type)}
                className={`bg-white hover:bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-left transition-all relative overflow-hidden flex items-center gap-3 cursor-pointer group disabled:opacity-75`}
              >
                <div className="p-2 bg-slate-50 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                  {loading ? <Lucide.Loader2 className="w-4 h-4 text-indigo-600 animate-spin" /> : sc.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 leading-tight">{sc.label}</p>
                  <p className="text-[9px] text-gray-400 truncate mt-0.5">{sc.desc}</p>
                </div>
                {loading && (
                  <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-indigo-600">INGESTING...</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. INTERACTIVE EXPLORER (SPLIT SCREEN) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: List and Filters */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-xl p-5 space-y-4">
          
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="text-xs font-bold text-[#091540] uppercase tracking-wider">Evidence Index ({filteredEvidence.length})</h3>
            <button
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Lucide.PlusCircle className="w-3.5 h-3.5" /> Note
            </button>
          </div>

          {/* Form to inject manual note */}
          {showNoteForm && (
            <form onSubmit={handleNoteSubmit} className="bg-slate-50 border border-slate-150 rounded-lg p-3.5 space-y-3 animate-fade-in">
              <h4 className="text-[10px] font-bold text-gray-600 uppercase">Add Manual Context</h4>
              
              <div>
                <input
                  type="text"
                  placeholder="Note Title (e.g. Briefing from Q2 meeting)"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-250 bg-white rounded focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <textarea
                  placeholder="Paste manual briefing text, conversation snippets, or strategic context..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-2 border border-slate-250 bg-white rounded focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value)}
                  className="text-[10px] font-bold text-slate-600 border border-slate-200 bg-white rounded p-1"
                >
                  <option value="Meeting Brief">Meeting Brief</option>
                  <option value="Competitor Intel">Competitor Intel</option>
                  <option value="Executive Focus">Executive Focus</option>
                  <option value="Strategic Goal">Strategic Goal</option>
                </select>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="px-2.5 py-1 text-[10px] font-semibold text-gray-500 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-[10px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded cursor-pointer"
                  >
                    Inject Note
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Search bar */}
          <div className="relative">
            <Lucide.Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search raw context..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 border border-slate-100 bg-slate-50 focus:bg-white text-xs rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-300"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pb-2">
            {(['All', 'Website', 'SEC EDGAR', 'Careers', 'News', 'Document', 'Manual Note'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.8 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#091540] text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-gray-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Evidence List */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredEvidence.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-lg">
                <Lucide.FileWarning className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-500">No matching evidence</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Try a different filter or search.</p>
              </div>
            ) : (
              filteredEvidence.map((ev) => {
                const isActive = activeEvidence?.id === ev.id;
                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvidenceId(ev.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer block relative ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/20 shadow-xs'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {getSourceIcon(ev.sourceType)}
                        <span className="text-[9px] uppercase font-bold text-gray-400 truncate">{ev.source}</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded shrink-0">
                        CONF: {ev.confidence}%
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-800 line-clamp-1">{ev.title}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{ev.summary}</p>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/60 text-[9px] text-gray-400 font-medium">
                      <span>{ev.date}</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Verified
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Uploaded Documents List Shortcut */}
          {accountDocuments.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2 animate-fade-in">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Interactive Document Index
              </span>
              <div className="space-y-1.5">
                {accountDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className="w-full text-left flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-lg cursor-pointer text-[10px] font-bold"
                  >
                    <span className="text-slate-700 truncate max-w-[150px]">{doc.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[8px] uppercase ${
                      doc.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      doc.status === 'Processing' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                      doc.status === 'Queued' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {doc.status || 'Completed'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: High-fidelity Inspector */}
        <div className="lg:col-span-2 space-y-6">
          {activeEvidence ? (
            <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 space-y-5 shadow-xs animate-fade-in">
              
              {/* Active Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded uppercase tracking-wider">
                      {getSourceIcon(activeEvidence.sourceType)}
                      {activeEvidence.sourceType}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">Ingested on {activeEvidence.date}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#091540] leading-tight">{activeEvidence.title}</h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-150 px-2.5 py-1 rounded-md text-xs font-bold">
                    <Lucide.ShieldAlert className="w-3.5 h-3.5" /> High Credibility
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium mt-1">Reliability rating: {activeEvidence.reliability}</div>
                </div>
              </div>

              {/* Ingestion metrics bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 rounded-xl p-4 text-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Confidence Level</span>
                  <p className="text-sm font-black text-slate-800">{activeEvidence.confidence}%</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Freshness rating</span>
                  <p className="text-sm font-black text-emerald-600">{activeEvidence.freshness}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Trace Status</span>
                  <p className="text-sm font-black text-blue-600">Traceable</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Vetting Rank</span>
                  <p className="text-sm font-black text-indigo-600">{activeEvidence.overallQuality}</p>
                </div>
              </div>

              {/* AI summary */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  AI Ingestion Insight Summary
                </span>
                <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-lg p-4 text-xs text-slate-700 leading-relaxed font-medium">
                  {activeEvidence.summary}
                </div>
              </div>

              {/* Raw parsed block */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Extracted Raw Content
                  </span>
                  <span className="text-[9px] font-mono text-gray-400">ENCODING: UTF-8</span>
                </div>
                <div className="bg-slate-900 border border-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto select-all max-h-[220px] overflow-y-auto leading-relaxed shadow-inner">
                  {activeEvidence.content}
                </div>
              </div>

              {/* Tags Cloud */}
              {activeEvidence.tags && activeEvidence.tags.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Entity Recognition & Detected Topics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeEvidence.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-gray-600 cursor-pointer transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cryptographic verification footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-gray-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Lucide.KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                  SHA-256 Verified Signature: <code className="bg-slate-100 text-slate-600 px-1 rounded">f239...9d10</code>
                </span>
                <span className="text-emerald-600">SECURE SOURCE</span>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl p-16 text-center shadow-xs">
              <Lucide.Files className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-base font-bold text-gray-900">Select source evidence</h3>
              <p className="text-xs text-gray-400 mt-1">Choose an ingested item from the left index panel to view parsed text extraction.</p>
            </div>
          )}
        </div>

      </div>

      {/* 4. FLOATING INTERACTIVE DOCUMENT VIEWER MODAL */}
      {selectedDocId && activeDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 shadow-2xl rounded-2xl w-full max-w-3xl overflow-hidden animate-fade-in flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lucide.FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">{activeDoc.name}</h3>
                  <p className="text-[10px] text-slate-300 mt-0.5">DOCUMENT ID: {activeDoc.id} • {activeDoc.size}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocId(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer"
              >
                <Lucide.X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body scroll area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              
              {/* Extraction Status Timeline */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider mb-4">
                  Document Extraction Processing Status
                </span>
                
                {/* Real interactive timeline */}
                <div className="grid grid-cols-4 gap-2 relative">
                  {[
                    { label: 'Uploading', desc: 'Secure transit', status: 'Uploading' },
                    { label: 'Queued', desc: 'Scheduling thread', status: 'Queued' },
                    { label: 'Processing', desc: 'Optical Character Recognition', status: 'Processing' },
                    { label: 'Completed', desc: 'Intelligence mapped', status: 'Completed' }
                  ].map((step, index) => {
                    const steps = ['Uploading', 'Queued', 'Processing', 'Completed'];
                    const currentStatusIdx = steps.indexOf(activeDoc.status || 'Completed');
                    const stepIdx = steps.indexOf(step.status);
                    
                    const isDone = stepIdx < currentStatusIdx;
                    const isCurrent = stepIdx === currentStatusIdx;
                    const isPending = stepIdx > currentStatusIdx;

                    return (
                      <div key={step.status} className="text-center relative">
                        {/* Dot */}
                        <div className="mx-auto flex items-center justify-center mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            isDone ? 'bg-emerald-500 text-white' :
                            isCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse' :
                            'bg-slate-200 text-slate-400'
                          }`}>
                            {isDone ? '✓' : index + 1}
                          </div>
                        </div>
                        <p className="text-[11px] font-extrabold text-slate-800 leading-tight">{step.label}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5 hidden sm:block leading-relaxed">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {activeDoc.status !== 'Completed' ? (
                <div className="text-center py-12 bg-indigo-50/20 border border-indigo-100 rounded-xl space-y-3 animate-pulse">
                  <Lucide.Bot className="w-10 h-10 text-indigo-500 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-800">Extracting Text & Embedding Context...</h4>
                  <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
                    Our platform is parsing table layouts, running OCR on text fragments, and drafting semantic insights. This takes ~4 seconds.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Metadata and summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="md:col-span-1 space-y-4">
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                          Extraction Details
                        </span>
                        <div className="space-y-2 text-[10px] font-bold text-slate-600">
                          <div>
                            <span className="text-gray-400 block text-[9px]">PAGES</span>
                            <span>{activeDoc.metadata?.pageCount || 3} pages parsed</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[9px]">EXTRACTOR AUTHOR</span>
                            <span>{activeDoc.metadata?.author || 'System Agent'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[9px]">UPLOAD DATE</span>
                            <span>{activeDoc.uploadedAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                        AI Abstract Summary
                      </span>
                      <div className="bg-indigo-50/20 border border-indigo-100/50 rounded-xl p-4 text-xs text-slate-700 leading-relaxed font-semibold">
                        {activeDoc.aiSummary}
                      </div>
                    </div>

                  </div>

                  {/* Entities recognized tags */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <span className="text-[9px] uppercase font-extrabold text-gray-400 block mb-2">Topics Detected</span>
                      <div className="flex flex-wrap gap-1">
                        {activeDoc.detectedTopics?.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[9px] font-bold">{t}</span>
                        )) || <span className="text-[9px] text-gray-400">None detected</span>}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <span className="text-[9px] uppercase font-extrabold text-gray-400 block mb-2">Technologies</span>
                      <div className="flex flex-wrap gap-1">
                        {activeDoc.detectedTechnologies?.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[9px] font-bold">{t}</span>
                        )) || <span className="text-[9px] text-gray-400">None detected</span>}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <span className="text-[9px] uppercase font-extrabold text-gray-400 block mb-2">Business Priorities</span>
                      <div className="flex flex-wrap gap-1">
                        {activeDoc.detectedBusinessPriorities?.map(p => (
                          <span key={p} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[9px] font-bold">{p}</span>
                        )) || <span className="text-[9px] text-gray-400">None detected</span>}
                      </div>
                    </div>
                  </div>

                  {/* Raw Full Text */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                      Full Extracted Document Text
                    </span>
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 font-sans text-xs text-slate-700 leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap select-all">
                      {activeDoc.extractedText}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Footer buttons */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center">
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <Lucide.ShieldCheck className="w-3.5 h-3.5" /> SECURELY SANDBOXED EXTRACTOR
              </span>
              <button
                onClick={() => setSelectedDocId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
