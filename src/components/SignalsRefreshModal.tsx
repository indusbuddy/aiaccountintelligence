/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RefreshSignalsSummary, generateEmailDigestText, LEADERSHIP_EMAILS } from '../lib/signalsEngine';
import * as Lucide from 'lucide-react';

interface SignalsRefreshModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAccountId?: string | null;
}

export const SignalsRefreshModal: React.FC<SignalsRefreshModalProps> = ({
  isOpen,
  onClose,
  targetAccountId
}) => {
  const { 
    accounts, 
    refreshAccountSignals, 
    isRefreshingSignals, 
    lastSignalsRefreshSummary,
    navigate
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [selectedScope, setSelectedScope] = useState<'all' | 'single'>(targetAccountId ? 'single' : 'all');
  const [activeAccountScopeId, setActiveAccountScopeId] = useState<string>(targetAccountId || (accounts[0]?.id || ''));
  const [scanStep, setScanStep] = useState<number>(0);

  if (!isOpen) return null;

  const targetAccount = accounts.find(a => a.id === (selectedScope === 'single' ? activeAccountScopeId : targetAccountId));

  const handleStartRefresh = async () => {
    setScanStep(1);
    const targetIds = selectedScope === 'single' && activeAccountScopeId
      ? [activeAccountScopeId]
      : undefined; // all accounts

    try {
      await refreshAccountSignals(targetIds);
      setScanStep(2);
    } catch (err) {
      console.error('Failed to refresh signals:', err);
      setScanStep(0);
    }
  };

  const handleCopyDigest = (summary: RefreshSignalsSummary) => {
    const text = generateEmailDigestText(summary.dispatches);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNavigateToAccount = (accountId: string) => {
    navigate('accounts', accountId, 'research');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#091540] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-[#2563FF] rounded-xl border border-blue-400/20">
              <Lucide.Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Signal Intelligence Radar & Dispatch
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
                  Live Scanner
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Refresh target account signals and automatically dispatch alerts to account owners, Mahesh & Srini.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <Lucide.X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">

          {/* Guaranteed Notification Matrix Banner */}
          <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lucide.Send className="w-4 h-4 text-[#2563FF] shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#091540]">
                    Exclusive Market Signals Routing Matrix
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    ✓ Restricted to Account Owners, Mahesh & Srini
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Market signals are strictly and exclusively informed to:
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-800 shadow-2xs">
                    <Lucide.UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    Intellify Account Owner
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-800 shadow-2xs">
                    <Lucide.Shield className="w-3.5 h-3.5 text-purple-600" />
                    Mahesh (mahesh@intellifysolutions.com)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-800 shadow-2xs">
                    <Lucide.Shield className="w-3.5 h-3.5 text-purple-600" />
                    Srini (srini@intellifysolutions.com)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-0.5">
                  Non-owners and unauthorized team members will not receive or be informed of market signals for accounts they do not own.
                </p>
              </div>
            </div>
          </div>

          {/* Scope Selection (if not already completed) */}
          {!lastSignalsRefreshSummary && (
            <div className="space-y-4">
              <label className="text-[11px] uppercase font-bold tracking-wider text-gray-500 block">
                Select Scan Scope
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedScope('all')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    selectedScope === 'all'
                      ? 'border-[#091540] bg-slate-50 ring-1 ring-[#091540]'
                      : 'border-slate-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lucide.Layers className="w-4 h-4 text-[#2563FF]" />
                      <span className="text-xs font-bold text-[#091540]">All Target Accounts</span>
                    </div>
                    {selectedScope === 'all' && <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Scan across all {accounts.length} active enterprise accounts. Notifies all respective account leads and leadership.
                  </p>
                  <span className="text-[10px] font-mono text-gray-400">
                    Accounts: {accounts.map(a => a.name.split(' ')[0]).join(', ')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedScope('single')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    selectedScope === 'single'
                      ? 'border-[#091540] bg-slate-50 ring-1 ring-[#091540]'
                      : 'border-slate-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lucide.Building2 className="w-4 h-4 text-[#2563FF]" />
                      <span className="text-xs font-bold text-[#091540]">Specific Target Account</span>
                    </div>
                    {selectedScope === 'single' && <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Perform a focused deep-dive intent scan on one account and dispatch tailored alerts.
                  </p>
                  {selectedScope === 'single' && (
                    <select
                      value={activeAccountScopeId}
                      onChange={(e) => setActiveAccountScopeId(e.target.value)}
                      className="mt-1 w-full text-xs font-semibold py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white outline-hidden focus:ring-1 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.owner ? a.owner.split('(')[0].trim() : 'Unassigned'})
                        </option>
                      ))}
                    </select>
                  )}
                </button>
              </div>

              {/* Execution Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartRefresh}
                  disabled={isRefreshingSignals}
                  className="w-full py-3.5 px-5 bg-[#091540] hover:bg-[#152a6d] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {isRefreshingSignals ? (
                    <>
                      <Lucide.Loader2 className="w-4 h-4 animate-spin text-[#2563FF]" />
                      <span>Scanning Market & Buyer Signals...</span>
                    </>
                  ) : (
                    <>
                      <Lucide.Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>
                        Run Signals Intelligence Scan & Notify ({selectedScope === 'all' ? `All ${accounts.length} Accounts` : targetAccount?.name || 'Selected Account'})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Running State Animation */}
          {isRefreshingSignals && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-fade-in">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
                <Lucide.Radio className="w-6 h-6 text-amber-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#091540]">
                  Real-Time Intelligence Ingestion in Progress
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Aggregating corporate filings, purchase intent data, hiring changes, and AI adoption telemetry.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono font-bold text-blue-600">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                <span>Dispatching alert payload to Mahesh, Srini & Account Owners...</span>
              </div>
            </div>
          )}

          {/* Completed State: Dispatched Results & Details */}
          {lastSignalsRefreshSummary && !isRefreshingSignals && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Success Notification Status Pill */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-900">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
                    <Lucide.Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">
                      Signals Refreshed & Dispatches Sent Successfully!
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Discovered {lastSignalsRefreshSummary.totalNewSignalsCount} fresh buying signals across {lastSignalsRefreshSummary.refreshedCount} account(s). Alerts routed to Notifications Console.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyDigest(lastSignalsRefreshSummary)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                >
                  {copied ? (
                    <>
                      <Lucide.CheckCheck className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Lucide.Copy className="w-3.5 h-3.5" />
                      <span>Copy Email Digest</span>
                    </>
                  )}
                </button>
              </div>

              {/* List of Refreshed Accounts */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-gray-500">
                    Refreshed Accounts & Dispatched Notifications ({lastSignalsRefreshSummary.dispatches.length})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Refreshed: {new Date(lastSignalsRefreshSummary.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {lastSignalsRefreshSummary.dispatches.map((dispatch) => (
                    <div
                      key={dispatch.accountId}
                      className="p-4.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all shadow-2xs space-y-3"
                    >
                      {/* Account Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Lucide.Building2 className="w-4 h-4 text-[#091540]" />
                          <span className="font-bold text-sm text-[#091540]">{dispatch.accountName}</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            Score: {dispatch.newScore} (+{dispatch.scoreDelta})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleNavigateToAccount(dispatch.accountId)}
                          className="text-[11px] font-bold text-[#2563FF] hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Cockpit Signals</span>
                          <Lucide.ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Notified Stakeholders Pill Row */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="font-bold text-slate-400 uppercase tracking-wider">Alerts Delivered Exclusively To:</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-100">
                          👤 Intellify Owner: {dispatch.ownerName} ({dispatch.ownerEmail})
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-100">
                          🛡️ Mahesh (mahesh@intellifysolutions.com)
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-100">
                          🛡️ Srini (srini@intellifysolutions.com)
                        </span>
                      </div>

                      {/* Signals List */}
                      <div className="space-y-2 pt-1">
                        {dispatch.newSignals.map((signal, sIdx) => (
                          <div 
                            key={sIdx}
                            className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <Lucide.Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span className="font-bold text-xs text-slate-900 leading-snug">
                                  "{signal.signal}"
                                </span>
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0 font-mono ${
                                signal.urgency === 'Immediate'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {signal.urgency}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-600 pl-5">
                              <span className="font-semibold text-slate-700">Intellify Recommended Angle: </span>
                              {signal.businessImpact}
                            </div>

                            {signal.evidence && signal.evidence.length > 0 && (
                              <div className="text-[9px] text-slate-400 pl-5 font-mono">
                                Validated: {signal.evidence.map(e => e.source).join(' • ')} ({signal.confidence}% Confidence)
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset to Scan Again */}
              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleStartRefresh()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Lucide.RefreshCw className="w-3.5 h-3.5" />
                  <span>Rescan Now</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-[#091540] hover:bg-[#152a6d] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
