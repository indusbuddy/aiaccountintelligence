/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Stakeholder, Account, Research, StakeholderIntelligence as StakeholderIntelData } from '../types';
import * as Lucide from 'lucide-react';
import { exportStakeholderResearchPDF } from '../lib/pdfGenerator';

interface StakeholderIntelligenceProps {
  stakeholder: Stakeholder;
  account: Account;
  companyResearch: Research | null;
  allAccountStakeholders: Stakeholder[];
  onBack: () => void;
  onResearch: (id: string) => Promise<void>;
  onUpdateStakeholder: (updated: Stakeholder) => void;
}

// Predefined intelligence profiles for default contacts to show immediate ABM value
const PREDEFINED_INTELLIGENCE: Record<string, StakeholderIntelData> = {
  stk_ms_1: {
    basicInformation: {
      name: "Judson Althoff",
      title: "Chief Commercial Officer",
      department: "Sales & Commercial Operations",
      location: "Redmond, WA",
      email: "jalthoff@microsoft.com",
      company: "Microsoft"
    },
    roleAssessment: {
      persona: "Executive Sponsor",
      decisionAuthority: "Very High",
      technicalInfluence: "High",
      businessInfluence: "Very High"
    },
    likelyKPIs: [
      "Accelerate commercial cloud revenue growth",
      "Drive enterprise adoption of Azure AI and Copilot",
      "Expand strategic co-sell partnerships",
      "Modernize global field sales execution model"
    ],
    businessChallenges: [
      "Legacy on-premises migration lag in tier-2 accounts",
      "AI monetization scaling beyond initial pilots",
      "Complex commercial agreement structuring and cycle times"
    ],
    technologyFocus: ["Azure OpenAI", "Microsoft Copilot", "Dynamics 365", "Azure Synapse / Fabric", "Power Platform"],
    likelyPriorities: [
      "Scaling AI workloads in strategic Fortune 500 accounts",
      "Driving multi-year Azure commitment renewals",
      "Cross-industry digital transformation solutions"
    ],
    communicationStyle: "Executive, ROI Driven, Innovation Driven",
    recommendedApproach: "Focus strictly on business outcomes, accelerated time-to-market, and tangible customer case studies. Emphasize how Indus Health Plus's accelerators speed up Azure consumption.",
    recommendedQuestions: [
      "How is Microsoft aligning global partner incentives to accelerate co-sell motions around Microsoft Fabric?",
      "What are the primary friction points your enterprise teams encounter when trying to scale Azure OpenAI pilots into production?"
    ],
    recommendedIndusSolutions: [
      { solution: "Microsoft Fabric Assessment", whyRelevant: "Directly aligns with Judson's focus on accelerating Synapse and data modernization to power downstream AI applications." },
      { solution: "AI Migration Accelerators", whyRelevant: "Helps Microsoft field sales teams unlock customer roadblocks, speeding up large Azure commitments." }
    ],
    confidence: 95,
    evidence: ["Q3 Commercial Cloud Earnings Report", "Microsoft Partner Keynote transcript", "LinkedIn corporate statements"],
    influenceScore: 94,
    decisionPower: {
      budgetAuthority: "High",
      technicalAuthority: "Medium",
      businessAuthority: "High",
      overallDecisionPower: "High"
    },
    engagementStrategy: {
      bestOpeningConversation: "Focus on how Indus Health Plus can unblock and accelerate Azure commercial cloud consumption in strategic industry verticals.",
      businessAngle: "Accelerating commercial cloud annual recurring revenue (ARR) and co-selling opportunities.",
      technologyAngle: "Enterprise-grade scalable generative AI on Azure paired with unified data estates on Microsoft Fabric.",
      recommendedWorkshop: "Executive Co-Sell Alignment Workshop",
      relevantAccelerator: "Indus Health Plus Cloud Migration Framework",
      relevantCaseStudy: "Retail Giant Data Platform Modernization (35% Azure consumption lift)",
      likelyObjections: [
        "Partner conflict: We have a large global systems integrator (GSI) network. Why use Indus Health Plus?",
        "Capacity: Does Indus Health Plus have certified architects ready immediately?"
      ],
      suggestedNextMeeting: "15-minute partner channel alignment briefing"
    },
    discoveryQuestions: [
      "What are the biggest barriers your enterprise field sales teams face when positioning Microsoft Fabric?",
      "How is Microsoft planning to drive Azure OpenAI consumption in highly regulated industries?",
      "What partner capabilities are currently most in-demand from your account managers?",
      "How can we best align our technical accelerators with your quarterly consumption targets?",
      "Where are you seeing the most significant competitive pressure from alternative cloud providers?",
      "What role can Indus Health Plus play in supporting your direct strategic account plans?",
      "How do you evaluate co-sell partner quality and execution success?",
      "What is your target timeline for scaling industry-specific Copilot templates?",
      "How do we establish a frictionless escalation path for technical hurdles in active accounts?",
      "What is your vision for partner-led business value validation on Azure?"
    ],
    communicationPreview: {
      executiveEmail: "Subject: Strategic Partner Alignment: Unblocking Azure Consumption & Fabric Adoption\n\nDear Judson,\n\nI hope this email finds you well. Following your recent keynote on accelerating commercial cloud adoption, I wanted to share a brief update on how Indus Health Plus is helping regional enterprise clients unlock complex data estates to fuel Azure OpenAI workloads.\n\nWe have recently launched a Microsoft Fabric Ingestion Accelerator that has compressed initial implementation timelines by 40% for our shared retail and finance clients, resulting in an immediate 3x lift in underlying Azure consumption.\n\nI would welcome the opportunity to coordinate a brief, 15-minute discussion with your strategic partner leads to explore how we can align our technical accelerators to unblock active sales opportunities in your pipeline.\n\nBest regards,\n[Your Name]\nDirector of Alliances, Indus Health Plus",
      linkedInConnectionRequest: "Judson, enjoyed your recent keynote on scaling enterprise Azure AI. Indus Health Plus is built to unblock data estates (via Fabric) and accelerate commercial cloud consumption. I would love to connect to discuss partner alignment.",
      linkedInFollowUp: "Thanks for connecting, Judson. We are seeing major traction with our Fabric Migration Accelerator. I'd love to share a 1-page overview of how we unblocked 3 shared enterprise targets this quarter.",
      workshopInvitation: "You are cordially invited to our upcoming Executive Co-Sell Alignment Session, where we will outline shared target accounts, pre-built migration accelerators, and co-selling plays for Microsoft Fabric.",
      meetingAgenda: "1. Introductions & Alliance Objectives\n2. Case Study Review: Fabric & Azure AI Implementation\n3. Shared Enterprise Target Account Review\n4. Technical Support & Escalation SLA Alignment\n5. Next Steps & Action Items",
      discoveryCallAgenda: "1. Understand Microsoft partner co-sell priorities\n2. Discuss active deal friction points\n3. Position Indus Health Plus's Fabric & AI accelerators\n4. Map technical resources to current pipeline"
    }
  },
  stk_ms_3: {
    basicInformation: {
      name: "Corey Sanders",
      title: "VP of Microsoft Cloud for Industry",
      department: "Cloud & Solutions Architecture",
      location: "Redmond, WA",
      email: "csanders@microsoft.com",
      company: "Microsoft"
    },
    roleAssessment: {
      persona: "Technical Buyer",
      decisionAuthority: "High",
      technicalInfluence: "Very High",
      businessInfluence: "High"
    },
    likelyKPIs: [
      "Drive consumption of industry-specific cloud offerings",
      "Expand technical validation of complex solution architectures",
      "Ensure referenceable customer success for cloud migrations"
    ],
    businessChallenges: [
      "Custom integration friction across legacy systems",
      "High compliance and regulatory hurdles in cloud migrations",
      "Partner quality in delivering highly specialized industry architectures"
    ],
    technologyFocus: ["Industry Cloud Templates", "Azure Kubernetes Service", "Databricks on Azure", "Security & Compliance suites"],
    likelyPriorities: [
      "Establishing repeatable technical blueprints for regulated industries",
      "Accelerating large-scale database migrations",
      "Scaling secure AI reference architectures"
    ],
    communicationStyle: "Technical, ROI Driven, Risk Focused",
    recommendedApproach: "Highlight deep engineering capabilities, compliance certifications, and robust solution blueprints. Provide developer-to-developer technical validation.",
    recommendedQuestions: [
      "How are you addressing data residency and compliance friction in the Microsoft Cloud for Financial Services?",
      "What are the primary architectural challenges you see partners run into with large-scale multi-tenant migrations?"
    ],
    recommendedIndusSolutions: [
      { solution: "Application Modernization Blueprint", whyRelevant: "Offers deep technical validation frameworks to safely migrate legacy systems to containerized cloud architectures." },
      { solution: "Managed Compliance Services", whyRelevant: "Provides ongoing security monitoring that fits Corey's need for strict regulatory governance in specialized industries." }
    ],
    confidence: 90,
    evidence: ["Microsoft Build developer sessions", "Industry cloud product documentation", "Azure technical blog posts"],
    influenceScore: 88,
    decisionPower: {
      budgetAuthority: "Medium",
      technicalAuthority: "High",
      businessAuthority: "Medium",
      overallDecisionPower: "High"
    },
    engagementStrategy: {
      bestOpeningConversation: "Focus on technical excellence, compliant architecture, and our proven delivery blueprints for complex industry clouds.",
      businessAngle: "Reducing migration risk and delivery timelines for industry cloud solutions.",
      technologyAngle: "Secure, compliant Kubernetes orchestration and automated migration pipelines.",
      recommendedWorkshop: "Technical Architecture Deep Dive",
      relevantAccelerator: "Azure Governance & Landing Zones Blueprint",
      relevantCaseStudy: "Healthcare Provider Legacy Core Migration (HIPAA-compliant on Azure)",
      likelyObjections: [
        "Alternative stacks: The customer is considering AWS/GCP for this specific industry workload.",
        "Resource constraints: Do we have the depth in security-cleared architects?"
      ],
      suggestedNextMeeting: "Technical architect review call"
    },
    discoveryQuestions: [
      "What are the main architectural compliance hurdles you are encountering with health or financial sector clients?",
      "How does your team evaluate partner-built technical blueprints?",
      "Where do you see the most significant architectural friction in the current Cloud for Industry stack?",
      "How can we collaborate to develop joint repeatable technical solutions?",
      "What is your target timeline for migrating key on-premise industry databases?",
      "How do you approach cloud native security architecture for multi-tenant environments?",
      "What metrics do you use to evaluate delivery success for migration partners?",
      "What are the gaps in the current native Azure tools for industry migrations?",
      "How can Indus Health Plus best support your engineering validation cycles?",
      "What compliance frameworks are currently most requested by your prospects?"
    ],
    communicationPreview: {
      executiveEmail: "Subject: Technical Blueprint Alignment: Compliance & Migration Accelerators\n\nHi Corey,\n\nI've been following your updates on Microsoft Cloud for Industry compliance frameworks, especially regarding data residency challenges.\n\nIndus Health Plus recently completed a HIPAA-compliant core platform migration for a major healthcare provider, utilizing automated landing zones that compressed validation audits from 3 months to 2 weeks.\n\nWe have packaged these templates into a repeatable Azure Compliance Accelerator. I'd love to connect you with our lead systems architect for a quick, developer-centric walkthrough of our blueprint to see if this could help unblock some of your team's active healthcare and finance migrations.\n\nBest regards,\n[Your Name]\nLead Enterprise Architect, Indus Health Plus",
      linkedInConnectionRequest: "Corey, excellent work on the latest Cloud for Industry blueprints. Indus Health Plus focuses on unblocking compliance roadblocks during large-scale Azure migrations. Love to connect to share technical notes.",
      linkedInFollowUp: "Thanks for connecting, Corey. I'd love to drop a link to our open-source Azure Landing Zone security template which has been optimized for highly regulated sectors.",
      workshopInvitation: "You are invited to a Technical Architecture Blueprint review, focusing on cloud security posture, container orchestration, and automated migration compliance.",
      meetingAgenda: "1. Architecture Overview & Compliance Requirements\n2. landing Zone Automation Walkthrough\n3. Kubernetes Governance & DevSecOps Integration\n4. Security & Audit Trail Validation\n5. Open Engineering Discussion",
      discoveryCallAgenda: "1. Understand active compliance/security bottlenecks\n2. Review legacy architecture limitations\n3. Highlight Indus Health Plus landing zone accelerators\n4. Discuss technical collaboration roadmap"
    }
  }
};

export const StakeholderIntelligence: React.FC<StakeholderIntelligenceProps> = ({
  stakeholder,
  account,
  companyResearch,
  allAccountStakeholders,
  onBack,
  onResearch,
  onUpdateStakeholder
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'discovery' | 'solutions' | 'comms' | 'hierarchy'>('overview');
  const [isResearching, setIsResearching] = useState(false);
  const [reportsToVal, setReportsToVal] = useState(stakeholder.reportsTo || '');

  // Access combined intelligence (either pre-loaded or generated from Gemini)
  const intel: StakeholderIntelData | undefined = stakeholder.intelligence || PREDEFINED_INTELLIGENCE[stakeholder.id];

  const handleRunAIResearch = async () => {
    setIsResearching(true);
    try {
      await onResearch(stakeholder.id);
    } finally {
      setIsResearching(false);
    }
  };

  const handleExportPDF = () => {
    if (!intel) return;
    exportStakeholderResearchPDF(stakeholder, account, intel);
  };

  const handleReportsToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setReportsToVal(val);
    onUpdateStakeholder({
      ...stakeholder,
      reportsTo: val || undefined
    });
  };

  const handleRelationshipStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as any;
    onUpdateStakeholder({
      ...stakeholder,
      relationshipStatus: val || undefined
    });
  };

  const getInfluenceColor = (level?: string) => {
    if (level === 'Very High' || level === 'High') return 'text-rose-600 bg-rose-50 border-rose-100';
    if (level === 'Medium') return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-slate-600 bg-slate-100 border-slate-200';
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-gray-400 bg-gray-50';
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-100';
    return 'text-rose-700 bg-rose-50 border-rose-100';
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div id={`stk-intel-profile-${stakeholder.id}`} className="space-y-6 animate-fade-in text-gray-800">
      {/* Top Banner Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 text-gray-500 hover:text-gray-800 rounded-lg transition-all cursor-pointer border border-gray-200"
            title="Back to Directory"
          >
            <Lucide.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-[#091540]">{stakeholder.name}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getInfluenceColor(stakeholder.influence)}`}>
                {stakeholder.influence} Influence
              </span>
              {intel?.roleAssessment?.persona && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {intel.roleAssessment.persona}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {stakeholder.title} • <span className="font-semibold text-gray-600">{stakeholder.department}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {intel && (
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-2xs cursor-pointer inline-flex items-center gap-1.5 transition-all text-gray-700 bg-white border border-gray-200 hover:bg-slate-50"
            >
              <Lucide.FileDown className="w-3.5 h-3.5 text-red-500" />
              Export Briefing PDF
            </button>
          )}
          <button
            onClick={handleRunAIResearch}
            disabled={isResearching}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-sm cursor-pointer inline-flex items-center gap-1.5 transition-all text-white ${isResearching
              ? 'bg-[#091540]/60 cursor-not-allowed'
              : 'bg-[#091540] hover:bg-[#182a74]'
              }`}
          >
            <Lucide.Cpu className={`w-3.5 h-3.5 ${isResearching ? 'animate-spin' : ''}`} />
            {isResearching ? 'Synthesizing...' : intel ? 'Re-Run AI Research' : 'Generate AI Intelligence Profile'}
          </button>
        </div>
      </div>

      {/* Main Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Metadata & Linked Account Context */}
        <div className="lg:col-span-4 space-y-6">
          {/* Executive Metadata Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3.5 border-b border-gray-50 pb-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-gray-200 flex items-center justify-center font-black text-[#091540] text-lg uppercase shadow-xs">
                {stakeholder.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#091540]">Contact Identity</h3>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Updated: {stakeholder.lastUpdated ? new Date(stakeholder.lastUpdated).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Email</span>
                <span className="text-gray-700">{stakeholder.email || intel?.basicInformation?.email || 'Unknown'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Location</span>
                <span className="text-gray-700">{intel?.basicInformation?.location || 'Unknown'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">LinkedIn</span>
                <a
                  href={stakeholder.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1 font-bold"
                >
                  Profile <Lucide.ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Notes</span>
                <span className="text-gray-700 font-medium italic text-right max-w-[200px] truncate" title={stakeholder.notes}>{stakeholder.notes || 'None added'}</span>
              </div>

              {/* Relationship mapping fields */}
              <div className="pt-2 space-y-2">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Reports To</label>
                  <select
                    value={reportsToVal}
                    onChange={handleReportsToChange}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white outline-hidden font-semibold text-gray-600"
                  >
                    <option value="">-- No Direct Line Mapped --</option>
                    {allAccountStakeholders.filter(s => s.id !== stakeholder.id).map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.title})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Relationship Status</label>
                  <select
                    value={stakeholder.relationshipStatus || ''}
                    onChange={handleRelationshipStatusChange}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white outline-hidden font-semibold text-gray-600"
                  >
                    <option value="Unknown">Unknown / Cold</option>
                    <option value="Cold">Cold / Unfavorable</option>
                    <option value="Warm">Warm / Receptive</option>
                    <option value="Champion">Champion / Executive Sponsor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Company Intelligence Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <Lucide.Building className="w-4 h-4 text-[#091540]" />
              <h3 className="font-extrabold text-xs text-[#091540] uppercase tracking-wider">Linked Account Context</h3>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Company Summary</span>
                <p className="text-gray-600 font-medium leading-relaxed">
                  {companyResearch?.overview || 'No strategic overview compiled yet. Run research on the main Account page.'}
                </p>
              </div>

              {companyResearch?.strategicPriorities && companyResearch.strategicPriorities.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1.5">Strategic Priorities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {companyResearch.strategicPriorities.slice(0, 3).map((p, idx) => (
                      <span key={idx} className="bg-slate-50 text-slate-700 border border-slate-100 px-2 py-0.5 rounded text-[9px] font-bold">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {companyResearch?.techLandscape && companyResearch.techLandscape.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1.5">Tech Landscape Indicators</span>
                  <div className="flex flex-wrap gap-1.5">
                    {companyResearch.techLandscape.slice(0, 5).map((t, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[9px] font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {companyResearch?.buyingSignals && companyResearch.buyingSignals.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Active Buying Signals</span>
                  <ul className="space-y-1 text-gray-600 font-medium text-[11px] list-disc pl-4 leading-normal">
                    {companyResearch.buyingSignals.slice(0, 3).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed Intelligence Sections */}
        <div className="lg:col-span-8 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap border-b border-gray-100 bg-white p-1 rounded-xl shadow-xs border">
            {[
              { id: 'overview', label: 'Overview', icon: Lucide.LayoutDashboard },
              { id: 'strategy', label: 'Engagement Strategy', icon: Lucide.Target },
              { id: 'discovery', label: 'Discovery Questions', icon: Lucide.MessageSquare },
              { id: 'solutions', label: 'Solution Alignment', icon: Lucide.Compass },
              { id: 'comms', label: 'Communication Drafts', icon: Lucide.Mail },
              { id: 'hierarchy', label: 'Relationship Map', icon: Lucide.GitBranch }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === tab.id
                    ? 'bg-[#091540] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-slate-50'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm min-h-[400px]">
            {isResearching ? (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <Lucide.Cpu className="w-12 h-12 text-[#091540] animate-spin" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#091540]">Running Multi-Source Stakeholder Intelligence...</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    Gemini is currently cross-analyzing corporate filings, news, opportunity reports, and tech landscapes to map this stakeholder's buyer persona.
                  </p>
                </div>
              </div>
            ) : !intel ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Lucide.Cpu className="w-12 h-12 text-gray-300" />
                <div>
                  <h4 className="font-extrabold text-sm text-gray-700">No Intelligence Compiled</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    Generate a rich, multi-dimensional ABM assessment matching this stakeholder's profile against the accounts strategic data.
                  </p>
                  <button
                    onClick={handleRunAIResearch}
                    className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#091540] hover:bg-[#152563] rounded-lg shadow-sm"
                  >
                    Analyze with Google Gemini
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ========================================================= TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Header metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-100 rounded-xl p-4 shadow-2xs">
                        <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Influence Score</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-[#091540]">{intel.influenceScore || 'Unknown'}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">/ 100</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-rose-500 h-1.5" style={{ width: `${intel.influenceScore || 0}%` }}></div>
                        </div>
                      </div>

                      <div className="border border-gray-100 rounded-xl p-4 shadow-2xs">
                        <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Research Confidence</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-gray-800">{intel.confidence || 'Unknown'}%</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full border font-bold ${getConfidenceColor(intel.confidence)}`}>
                            {intel.confidence && intel.confidence >= 80 ? 'High' : 'Medium'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5" style={{ width: `${intel.confidence || 0}%` }}></div>
                        </div>
                      </div>

                      <div className="border border-gray-100 rounded-xl p-4 shadow-2xs">
                        <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Communication Style</span>
                        <span className="text-sm font-extrabold text-[#091540] truncate block mt-1.5">{intel.communicationStyle || 'Unknown'}</span>
                        <p className="text-[9px] text-gray-400 font-medium mt-1">Estimated decision engagement tone</p>
                      </div>
                    </div>

                    {/* Role Assessment & Authority Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-3.5">
                        <h4 className="font-extrabold text-xs text-[#091540] uppercase tracking-wider">Role Assessment</h4>
                        <div className="space-y-2.5 font-semibold text-xs text-gray-700">
                          <div className="flex justify-between py-1 border-b border-gray-50">
                            <span className="text-gray-400 font-medium">Buying Center Persona</span>
                            <span className="text-gray-800">{intel.roleAssessment?.persona || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-50">
                            <span className="text-gray-400 font-medium">Decision Authority</span>
                            <span className="text-gray-800">{intel.roleAssessment?.decisionAuthority || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-50">
                            <span className="text-gray-400 font-medium">Technical Influence</span>
                            <span className="text-gray-800">{intel.roleAssessment?.technicalInfluence || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-50">
                            <span className="text-gray-400 font-medium">Business Influence</span>
                            <span className="text-gray-800">{intel.roleAssessment?.businessInfluence || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>

                      {intel.decisionPower && (
                        <div className="space-y-3.5">
                          <h4 className="font-extrabold text-xs text-[#091540] uppercase tracking-wider">Decision Power Authority</h4>
                          <div className="space-y-2.5 font-semibold text-xs text-gray-700">
                            <div className="flex justify-between py-1 border-b border-gray-50">
                              <span className="text-gray-400 font-medium">Budget Authority</span>
                              <span className="text-gray-800">{intel.decisionPower.budgetAuthority || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                              <span className="text-gray-400 font-medium">Technical Authority</span>
                              <span className="text-gray-800">{intel.decisionPower.technicalAuthority || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                              <span className="text-gray-400 font-medium">Business Authority</span>
                              <span className="text-gray-800">{intel.decisionPower.businessAuthority || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                              <span className="text-gray-400 font-medium">Overall Decision Power</span>
                              <span className="text-gray-800">{intel.decisionPower.overallDecisionPower || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Likely KPIs, Challenges & Tech interests */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                      {/* KPIs */}
                      <div className="bg-slate-50/50 rounded-xl p-4.5 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Lucide.TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                          <h4 className="font-bold text-xs text-[#091540]">Likely KPIs</h4>
                        </div>
                        <ul className="space-y-2 text-[11px] text-gray-600 font-medium leading-normal pl-4 list-disc">
                          {intel.likelyKPIs && intel.likelyKPIs.length > 0 ? (
                            intel.likelyKPIs.map((k, i) => <li key={i}>{k}</li>)
                          ) : (
                            <li className="list-none text-gray-400 pl-0 italic">None determined</li>
                          )}
                        </ul>
                      </div>

                      {/* Business Challenges */}
                      <div className="bg-slate-50/50 rounded-xl p-4.5 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Lucide.AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <h4 className="font-bold text-xs text-[#091540]">Business Challenges</h4>
                        </div>
                        <ul className="space-y-2 text-[11px] text-gray-600 font-medium leading-normal pl-4 list-disc">
                          {intel.businessChallenges && intel.businessChallenges.length > 0 ? (
                            intel.businessChallenges.map((c, i) => <li key={i}>{c}</li>)
                          ) : (
                            <li className="list-none text-gray-400 pl-0 italic">None determined</li>
                          )}
                        </ul>
                      </div>

                      {/* Tech Focus */}
                      <div className="bg-slate-50/50 rounded-xl p-4.5 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Lucide.Cpu className="w-3.5 h-3.5 text-indigo-600" />
                          <h4 className="font-bold text-xs text-[#091540]">Technology Interests</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {intel.technologyFocus && intel.technologyFocus.length > 0 ? (
                            intel.technologyFocus.map((t, i) => (
                              <span key={i} className="bg-indigo-50 border border-indigo-100/50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-[11px] italic font-medium">None determined</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Research Evidence */}
                    {intel.evidence && intel.evidence.length > 0 && (
                      <div className="pt-4 border-t border-gray-50">
                        <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2.5">Source Evidence Backing Profile</h4>
                        <div className="flex flex-wrap gap-2">
                          {intel.evidence.map((ev, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                              <Lucide.FileText className="w-3 h-3 text-gray-400" />
                              {ev}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ============================================== TAB: ENGAGEMENT STRATEGY */}
                {activeTab === 'strategy' && intel.engagementStrategy && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-50 pb-4">
                      <h3 className="text-sm font-extrabold text-[#091540]">Engagement Strategy Framework</h3>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Structured pitch planning, objection handling, and workshop recommendation</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Best Opening Conversation Topic</span>
                          <p className="text-xs text-gray-700 font-medium bg-blue-50/40 p-3 rounded-lg border border-blue-50 leading-relaxed">
                            {intel.engagementStrategy.bestOpeningConversation}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Business Engagement Angle</span>
                          <p className="text-xs text-gray-700 font-medium leading-relaxed">
                            {intel.engagementStrategy.businessAngle}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Wellness &amp; Preventive Health Alignment Angle</span>
                          <p className="text-xs text-gray-700 font-medium leading-relaxed">
                            {intel.engagementStrategy.technologyAngle}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 p-3.5 rounded-lg border border-gray-100">
                            <span className="text-[9px] uppercase text-gray-400 font-bold block mb-1">Recommended Workshop</span>
                            <span className="text-xs font-extrabold text-[#091540] block">{intel.engagementStrategy.recommendedWorkshop}</span>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-lg border border-gray-100">
                            <span className="text-[9px] uppercase text-gray-400 font-bold block mb-1">Relevant Accelerator</span>
                            <span className="text-xs font-extrabold text-[#091540] block">{intel.engagementStrategy.relevantAccelerator}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Recommended Case Study Reference</span>
                          <p className="text-xs text-[#091540] font-bold bg-[#091540]/5 p-3 rounded-lg border border-[#091540]/10">
                            {intel.engagementStrategy.relevantCaseStudy}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Likely Objection Handling</span>
                          <div className="space-y-2.5 mt-1.5">
                            {intel.engagementStrategy.likelyObjections.map((obj, i) => (
                              <div key={i} className="text-xs text-gray-600 font-medium flex gap-2 items-start bg-rose-50/30 p-2 border border-rose-50 rounded-lg">
                                <Lucide.AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                <span>{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Suggested Next Meeting Structure</span>
                          <p className="text-xs text-gray-700 font-semibold italic">
                            "{intel.engagementStrategy.suggestedNextMeeting}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================== TAB: DISCOVERY QUESTIONS */}
                {activeTab === 'discovery' && intel.discoveryQuestions && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-50 pb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-[#091540]">10 Tailored Discovery Questions</h3>
                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5">High-impact discovery queries designed specifically for corporate priorities and role mapping</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(intel.discoveryQuestions!.join('\n'), 'Discovery Questions')}
                        className="px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:text-[#091540] border border-gray-200 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Lucide.Copy className="w-3 h-3" /> Copy All Questions
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {intel.discoveryQuestions.map((q, i) => (
                        <div key={i} className="border border-gray-50 hover:border-blue-100 p-4 rounded-xl hover:bg-blue-50/10 transition-all font-semibold flex gap-3 items-start">
                          <div className="w-5.5 h-5.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100/50 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed font-bold">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ============================================== TAB: SOLUTION ALIGNMENT */}
                {activeTab === 'solutions' && intel.recommendedIndusSolutions && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-50 pb-4">
                      <h3 className="text-sm font-extrabold text-[#091540]">Recommended Indus Health Plus Solutions Offerings</h3>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Specific Indus Health Plus solution alignments based on workforce health &amp; HR priorities</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {intel.recommendedIndusSolutions.map((sol, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-5 shadow-2xs space-y-3 hover:shadow-xs transition-all bg-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center">
                              <Lucide.Compass className="w-4 h-4 text-indigo-600" />
                            </div>
                            <h4 className="font-extrabold text-sm text-[#091540]">{sol.solution}</h4>
                          </div>
                          <p className="text-xs text-gray-600 font-medium leading-relaxed">
                            {sol.whyRelevant}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ============================================== TAB: COMMUNICATION DRAFTS */}
                {activeTab === 'comms' && intel.communicationPreview && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-50 pb-4">
                      <h3 className="text-sm font-extrabold text-[#091540]">Communication Copywriting Drafts</h3>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Automated ABM executive drafts. Copy text blocks to personalize your pipeline outreach</p>
                    </div>

                    <div className="space-y-5">
                      {/* Email template */}
                      <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
                        <div className="bg-slate-50/70 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                            <Lucide.Mail className="w-3.5 h-3.5" /> Executive Email Draft
                          </span>
                          <button
                            onClick={() => copyToClipboard(intel.communicationPreview!.executiveEmail, 'Email Draft')}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Lucide.Copy className="w-3 h-3" /> Copy
                          </button>
                        </div>
                        <div className="p-4 bg-slate-50/20 font-mono text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {intel.communicationPreview.executiveEmail}
                        </div>
                      </div>

                      {/* LinkedIn and meeting invites in 2 col */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
                          <div className="bg-slate-50/70 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                              <Lucide.Linkedin className="w-3.5 h-3.5" /> LinkedIn Connection Request
                            </span>
                            <button
                              onClick={() => copyToClipboard(intel.communicationPreview!.linkedInConnectionRequest, 'LinkedIn Note')}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Lucide.Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <div className="p-4 bg-slate-50/20 text-xs text-gray-700 font-medium leading-relaxed">
                            {intel.communicationPreview.linkedInConnectionRequest}
                          </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
                          <div className="bg-slate-50/70 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                              <Lucide.Users className="w-3.5 h-3.5" /> Workshop Invitation
                            </span>
                            <button
                              onClick={() => copyToClipboard(intel.communicationPreview!.workshopInvitation, 'Workshop Invite')}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Lucide.Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <div className="p-4 bg-slate-50/20 text-xs text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                            {intel.communicationPreview.workshopInvitation}
                          </div>
                        </div>
                      </div>

                      {/* Agendas */}
                      <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
                        <div className="bg-slate-50/70 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                            <Lucide.CalendarDays className="w-3.5 h-3.5" /> 30-Min Formal Meeting Agenda
                          </span>
                          <button
                            onClick={() => copyToClipboard(intel.communicationPreview!.meetingAgenda, 'Meeting Agenda')}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Lucide.Copy className="w-3 h-3" /> Copy
                          </button>
                        </div>
                        <div className="p-4 bg-slate-50/20 font-mono text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {intel.communicationPreview.meetingAgenda}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================================================== TAB: HIERARCHY */}
                {activeTab === 'hierarchy' && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-50 pb-4">
                      <h3 className="text-sm font-extrabold text-[#091540]">Organizational Hierarchy Map</h3>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Custom visual mapping of reported reporting lines to map critical purchase path and buying centers</p>
                    </div>

                    {/* Hierarchy render */}
                    <div className="bg-slate-50/35 border border-gray-100 rounded-xl p-6 flex flex-col items-center">
                      <div className="w-full max-w-md space-y-4">
                        {/* Level 1: CEO / Executive Sponsor */}
                        <div className="flex flex-col items-center">
                          <div className="bg-[#091540] text-white border border-slate-700 px-4 py-2.5 rounded-lg text-center shadow-xs w-64">
                            <span className="text-[8px] uppercase tracking-wider text-gray-400 font-bold block mb-0.5">Executive Sponsor (C-Suite)</span>
                            <span className="text-xs font-black block truncate">{stakeholder.role === 'Decision Maker' ? stakeholder.name : 'Chief Executive Officer (CEO)'}</span>
                            <span className="text-[10px] text-gray-300 font-medium truncate block">{stakeholder.role === 'Decision Maker' ? stakeholder.title : 'Target Enterprise Lead'}</span>
                          </div>
                        </div>

                        {/* Arrow down */}
                        <div className="flex justify-center">
                          <div className="w-0.5 bg-gray-200 h-6 border-dashed border-l"></div>
                        </div>

                        {/* Level 2: CIO / VP / Decision Maker */}
                        <div className="flex flex-col items-center">
                          <div className="bg-blue-600 text-white border border-blue-500 px-4 py-2.5 rounded-lg text-center shadow-xs w-64">
                            <span className="text-[8px] uppercase tracking-wider text-blue-200 font-bold block mb-0.5">Decision Maker</span>
                            <span className="text-xs font-black block truncate">{stakeholder.name}</span>
                            <span className="text-[10px] text-blue-100 font-medium truncate block">{stakeholder.title}</span>
                          </div>
                        </div>

                        {/* Arrow down */}
                        <div className="flex justify-center">
                          <div className="w-0.5 bg-gray-200 h-6 border-dashed border-l"></div>
                        </div>

                        {/* Level 3: Reporting Managers / Influencers / Champions */}
                        <div className="flex flex-col items-center">
                          <div className="flex flex-wrap justify-center gap-3 w-full">
                            {allAccountStakeholders.filter(s => s.id !== stakeholder.id).slice(0, 3).map((stk, idx) => (
                              <div key={idx} className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-center shadow-2xs w-44">
                                <span className={`text-[8px] uppercase font-bold block mb-0.5 ${stk.role === 'Champion' ? 'text-indigo-600' : 'text-gray-400'
                                  }`}>{stk.role}</span>
                                <span className="text-[10px] font-extrabold text-gray-800 block truncate">{stk.name}</span>
                                <span className="text-[9px] text-gray-400 font-semibold block truncate">{stk.title}</span>
                              </div>
                            ))}
                            {allAccountStakeholders.filter(s => s.id !== stakeholder.id).length === 0 && (
                              <div className="bg-white border border-gray-100 px-4 py-3 rounded-lg text-center text-gray-400 text-xs italic font-medium">
                                No secondary contacts mapped in this hierarchy block yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
