/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as Lucide from 'lucide-react';

export const CommunicationScreen: React.FC = () => {
  const { accounts, navigate, triggerResearch } = useApp();
  
  // Completed accounts list
  const completedAccounts = accounts.filter(a => a.researchStatus === 'Completed');
  
  // States
  const [selectedAccId, setSelectedAccId] = useState(completedAccounts[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'email' | 'linkedin' | 'workshop' | 'discovery'>('email');

  const selectedAccount = accounts.find(a => a.id === selectedAccId);

  // Fallback if user selects or has no completed accounts
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccId(e.target.value);
  };

  // Personalized content compiler (simulated logic)
  const getPersonalizedContent = () => {
    if (!selectedAccount) return { subject: '', body: '' };

    const name = selectedAccount.name;
    const owner = selectedAccount.owner.split(' ')[0]; // Just first name
    const sector = selectedAccount.industry;

    // Set variable details based on target
    let strategicGoal = 'driving enterprise transformation';
    let specificChallenge = 'computational costs';
    let recommendedService = 'Enterprise AI Strategy Briefing';

    if (selectedAccount.id === 'acc_microsoft') {
      strategicGoal = 'scaling enterprise AI adoption through Cloud';
      specificChallenge = 'computational overhead in large scale LLMs';
      recommendedService = 'Cross-Industry GenAI Advisory';
    } else if (selectedAccount.id === 'acc_nike') {
      strategicGoal = 'driving localized predictive inventory allocation models';
      specificChallenge = 'inventory stock build-up across distribution centers';
      recommendedService = 'D2C Hyper-Personalization Consulting';
    } else if (selectedAccount.id === 'acc_tesla') {
      strategicGoal = 'regulatory clearance for unsupervised Autopilot operations';
      specificChallenge = 'automated manufacturing lines resource friction';
      recommendedService = 'Gigafactory Supply Chain Risk Modeling';
    } else {
      strategicGoal = 'automating manual workflows across departments';
      specificChallenge = 'data fragmentation and regulatory audits';
      recommendedService = 'Process Automation Blueprinting';
    }

    switch (activeTab) {
      case 'email':
        return {
          subject: `Co-Innovating on GenAI: Accelerating ${name}'s Strategic Roadmap`,
          body: `Dear C-Level Technology Sponsor,

I recently reviewed your active strategic priorities for ${strategicGoal}, and it is clear that ${name} is leading the frontier in driving enterprise digitization.

At Intellify, we specialize in high-impact AI accelerators that align directly with ${sector} leaders. Specifically, we see a massive opportunity for ${name} to leverage our pre-built modules for ${recommendedService}, which would address current challenges in ${specificChallenge} that we identified.

We have compiled a briefing paper mapping our capabilities specifically to your current initiatives. Do you have 15 minutes next Tuesday at 10:00 AM CST for a brief introductory discussion?

Sincerely,

${owner}
Intellify Account Intelligence`
        };

      case 'linkedin':
        return {
          subject: 'LinkedIn Message',
          body: `Hi Judson Althoff,

Fascinated by your leadership of ${name}'s push into ${strategicGoal}.

At Intellify, we recently completed a benchmark of ${sector} digitization models, specifically looking at how custom agents resolve the bottlenecks in ${specificChallenge} you have highlighted.

I would love to send over our customized findings for ${name} if you are open to a brief exchange of thoughts next week.

Best,
${owner}`
        };

      case 'workshop':
        return {
          subject: 'Digital Discovery Workshop Agenda',
          body: `# Digital Discovery & AI Roadmap Alignment Workshop
## Client: ${name}

### Objective:
Align executive sponsors, IT leads, and business unit owners on high-probability generative AI use cases, identifying three concrete pilots.

### Agenda:
1. **00:00 - 00:15 | Welcome & Context Setting**
   - Introductions and brief overview of Intellify's research on ${name}'s ${strategicGoal}.
2. **00:15 - 00:45 | Technology Landscape Benchmark**
   - Mapping current systems against high-efficiency modern alternatives in ${sector}.
3. **00:45 - 01:30 | Co-Innovation Ideation & Brainstorm**
   - Group breakout to map pain points in ${specificChallenge} and prioritize potential accelerators.
4. **01:30 - 01:50 | Prioritization Grid (Value vs. Feasibility)**
   - Plotting identified pilots on the 2x2 roadmap matrix.
5. **01:50 - 02:00 | Next Steps & Executive Summary**
   - Defining pilot scopes, timeline, and Proof of Concept (PoC) checkpoints.`
        };

      case 'discovery':
        return {
          subject: 'Discovery Interview Questions',
          body: `## Diagnostic Discovery Script for ${name} Key Sponsors

### Opening Framing (5 mins)
- Build rapport; acknowledge their recent work or company updates.
- State goal: "We want to understand the active operational friction points in internal systems to ensure any future pilot is highly targeted."

### Core Discovery Questions (25 mins)
1. "Regarding your focus on ${strategicGoal}, what has been the primary barrier to accelerating internal adoption?"
2. "We identified ${specificChallenge} as a potential friction point in our industry research. How is that currently manifesting inside your team's workflow?"
3. "If you could automate or inject intelligence into a single process in the next 30 days with zero friction, which would it be?"

### Alignment & Solution Mapping (15 mins)
- Map their responses live to Intellify's ${recommendedService}.
- Describe high-level success story of a peer organization.`
        };
    }
  };

  const compiled = getPersonalizedContent();

  return (
    <div id="comms-workbench-page" className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#091540] sm:text-3xl">Engagement & Communication Workbench</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Synthesize personalized, C-level corporate messaging and discovery agendas pre-aligned to target company structures.
        </p>
      </div>

      {completedAccounts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center">
          <Lucide.MailOpen className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-gray-900">Personalization Engines Inactive</h3>
          <p className="text-xs text-gray-400 mt-1 mb-5 max-w-sm">
            Reps must complete research on at least one target account to compile customized outbound collateral.
          </p>
          <button
            onClick={() => navigate('research')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#091540] hover:bg-[#15276e] rounded-lg shadow-sm cursor-pointer"
          >
            Go to Research Control Center
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Target Selector Bar */}
          <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#091540] uppercase tracking-wider text-[11px]">Select Target Company:</span>
              <select
                value={selectedAccId}
                onChange={handleSelectChange}
                className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden text-[#091540]"
              >
                {completedAccounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            
            <div className="text-xs text-gray-400 font-medium">
              Priority: <span className="font-bold text-rose-600">{selectedAccount?.priority}</span> • suitability Index: <span className="font-bold text-[#091540]">{selectedAccount?.opportunityScore}%</span>
            </div>
          </div>

          {/* Interactive Work Console */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Category Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              {[
                { id: 'email', label: 'C-Suite Cold Pitch', desc: 'Personalized cold email pitch.', icon: 'MailOpen' },
                { id: 'linkedin', label: 'LinkedIn Short Frame', desc: 'Direct conversational outreach.', icon: 'Linkedin' },
                { id: 'workshop', label: 'Co-Innovation Agenda', desc: 'Custom 2-hour alignment schedule.', icon: 'Presentation' },
                { id: 'discovery', label: 'Diagnostic Script', desc: 'Core discovery interview structure.', icon: 'HelpCircle' }
              ].map((tab) => {
                const Icon = Lucide[tab.icon as keyof typeof Lucide] as React.ComponentType<{ className?: string }>;
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isCurrent
                        ? 'border-[#091540] bg-[#091540] text-white shadow-xs'
                        : 'border-gray-100 bg-white hover:bg-slate-50 text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isCurrent ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
                      {Icon && <Icon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold">{tab.label}</h4>
                      <p className={`text-[9px] mt-0.5 font-medium line-clamp-1 ${isCurrent ? 'text-slate-300' : 'text-gray-400'}`}>
                        {tab.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Compiled Preview Window */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-150 rounded-xl shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-[#2563FF] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded uppercase">
                      Personalized Output
                    </span>
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mt-2.5">
                      {activeTab === 'email' && 'Cold Email Pitch'}
                      {activeTab === 'linkedin' && 'LinkedIn Message Outline'}
                      {activeTab === 'workshop' && 'Alignment Workshop Agenda'}
                      {activeTab === 'discovery' && 'Discovery Question Checklist'}
                    </h3>
                  </div>
                  <button
                    onClick={() => alert('Outreach briefing successfully copied to clipboard')}
                    className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-[#091540] border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Lucide.Copy className="w-3.5 h-3.5" />
                    Copy Template
                  </button>
                </div>

                {/* Email Subject block if applicable */}
                {activeTab === 'email' && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex gap-2 text-xs text-gray-500">
                    <span className="font-bold text-gray-400">Subject:</span>
                    <span className="font-semibold text-gray-800">{compiled.subject}</span>
                  </div>
                )}

                {/* Main preformatted code/text */}
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl max-h-[420px] overflow-y-auto">
                  <pre className="text-xs font-mono font-medium text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {compiled.body}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
