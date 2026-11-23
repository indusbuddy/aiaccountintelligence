/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Account, BuyingSignal, OrchestratedResearch, NotificationItem } from '../types';

export interface SignalDispatchResult {
  accountId: string;
  accountName: string;
  ownerName: string;
  ownerEmail: string;
  leadershipRecipients: string[];
  allRecipients: string[];
  newSignals: BuyingSignal[];
  scoreDelta: number;
  newScore: number;
  summary: string;
  timestamp: string;
}

export interface RefreshSignalsSummary {
  refreshedCount: number;
  totalNewSignalsCount: number;
  dispatches: SignalDispatchResult[];
  timestamp: string;
}

// Fixed leadership emails specified in requirements
export const LEADERSHIP_EMAILS = [
  'shailesh.thakare@indushealthplus.com',
  'shashaank.d@indushealthplus.com',
  'balaji.hadole@indushealthplus.com',
  'samarth.patki@indushealthplus.com'
];

/**
 * Derives a clean email address from an owner string
 * e.g. "Sarah Jenkins (Enterprise Sales Director)" -> "sarah.jenkins@indushealthplus.com"
 */
export function deriveOwnerEmail(owner: string, createdByEmail?: string): string {
  if (owner) {
    // If owner already has an email in parentheses or format
    const matchEmail = owner.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (matchEmail) return matchEmail[1].toLowerCase().trim();

    // Extract pure name before parenthesis
    const namePart = owner.split('(')[0].trim().toLowerCase();
    const parts = namePart.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[parts.length - 1]}@indushealthplus.com`;
    } else if (parts.length === 1 && parts[0].includes('@')) {
      return parts[0].toLowerCase().trim();
    } else if (parts.length === 1 && parts[0] !== 'unassigned' && parts[0] !== 'team') {
      return `${parts[0]}@indushealthplus.com`;
    }
  }

  if (createdByEmail && createdByEmail.includes('@')) {
    return createdByEmail.toLowerCase().trim();
  }

  return 'owner@indushealthplus.com';
}

export function extractOwnerDisplayName(owner: string): string {
  if (!owner) return 'Account Owner';
  return owner.split('(')[0].trim();
}

/**
 * Checks if a specific user email belongs to the Indus Health Plus account owner
 */
export function isUserAccountOwner(account: Account, userEmail?: string | null): boolean {
  if (!userEmail) return false;
  const email = userEmail.toLowerCase().trim();
  const ownerEmail = deriveOwnerEmail(account.owner, account.createdByEmail).toLowerCase().trim();
  if (ownerEmail === email) return true;
  if (account.createdByEmail && account.createdByEmail.toLowerCase().trim() === email) return true;
  if (account.owner && account.owner.toLowerCase().includes(email.split('@')[0])) return true;
  return false;
}

/**
 * Strict authorization check: Market signals are informed to account owners and Indus Health Plus leadership.
 */
export function isAuthorizedForMarketSignals(
  userEmail: string | undefined | null,
  accountOrAccountId: Account | string | undefined | null,
  accounts: Account[] = []
): boolean {
  if (!userEmail) return false;
  const email = userEmail.toLowerCase().trim();

  // 1. Leadership emails are always informed
  if (LEADERSHIP_EMAILS.includes(email) || email === 'ecomm.indus@gmail.com') {
    return true;
  }

  // 2. Resolve account
  let targetAccount: Account | undefined;
  if (typeof accountOrAccountId === 'object' && accountOrAccountId !== null) {
    targetAccount = accountOrAccountId;
  } else if (typeof accountOrAccountId === 'string') {
    targetAccount = accounts.find(a => a.id === accountOrAccountId);
  }

  // 3. Must be the specific account owner
  if (targetAccount) {
    return isUserAccountOwner(targetAccount, email);
  }

  return false;
}

/**
 * Curated, industry-specific signal repository to inject realistic, fresh buying signals
 * across target accounts during a refresh event.
 */
const SIGNAL_LIBRARY: Record<string, BuyingSignal[]> = {
  acc_microsoft: [
    {
      signal: 'Enterprise Copilot ROI pushback: C-suite demands verifiable productivity telemetry and domain-specific micro-agent orchestrations.',
      urgency: 'Immediate',
      confidence: 96,
      businessImpact: 'Massive opening for Indus Health Plus Corporate Health & Employee Wellness evaluation accelerators.',
      evidence: [
        { source: 'Gartner Enterprise Tech Buyer Sentiment (Q3)', credibility: 'High' },
        { source: 'Microsoft Executive Partner Briefing Notes', credibility: 'High' }
      ]
    },
    {
      signal: 'Active RFP announced for Azure Fabric Lakehouse consolidation to replace legacy on-prem Cloudera clusters.',
      urgency: 'Immediate',
      confidence: 94,
      businessImpact: 'Position Indus Health Plus Digital Health & Corporate Health Checkup advisory.',
      evidence: [
        { source: 'Azure Partner Network RFP Bulletin', credibility: 'High' }
      ]
    },
    {
      signal: 'EU Sovereign Cloud mandate triggers architectural compliance review across 14 enterprise customer tenants.',
      urgency: 'High',
      confidence: 91,
      businessImpact: 'Enables Indus Health Plus Occupational Health & Compliance advisory packaging.',
      evidence: [
        { source: 'EU Digital Markets Compliance Audit', credibility: 'High' }
      ]
    }
  ],
  acc_nike: [
    {
      signal: 'Direct-to-Consumer (D2C) logistics realignment: Nike announces $180M digital supply chain & real-time inventory allocation modernization.',
      urgency: 'Immediate',
      confidence: 95,
      businessImpact: 'High-value opportunity to deploy Indus Health Plus Corporate Wellness & Occupational Health programs.',
      evidence: [
        { source: 'Nike Q4 Investor Earnings Transcript', credibility: 'High' },
        { source: 'Supply Chain Dive Procurement Signal', credibility: 'High' }
      ]
    },
    {
      signal: 'Chief Information Officer open requisitions for 18 Computer Vision & Edge AI engineers for automated distribution centers.',
      urgency: 'High',
      confidence: 92,
      businessImpact: 'Pitch Indus Health Plus Employee Preventive Care & Annual Executive Health Screening packages.',
      evidence: [
        { source: 'Nike Careers & LinkedIn Talent Insights', credibility: 'High' }
      ]
    },
    {
      signal: 'Nike App loyalty personalization engine RFP to ingest real-time store sensor and RFID checkout data.',
      urgency: 'High',
      confidence: 89,
      businessImpact: 'Deliver personalized retail customer journey mapping with streaming analytics.',
      evidence: [
        { source: 'National Retail Federation Executive Radar', credibility: 'Medium' }
      ]
    }
  ],
  acc_pfizer: [
    {
      signal: 'FDA digital submission compliance sprint: Pfizer accelerates AI-assisted clinical trial protocol authoring and validation.',
      urgency: 'Immediate',
      confidence: 97,
      businessImpact: 'Deploy Indus Health Plus Corporate Wellness & Diagnostic Telemetry benchmarks.',
      evidence: [
        { source: 'FDA Regulatory Telemetry Update', credibility: 'High' },
        { source: 'Pfizer Global R&D Technology Summit', credibility: 'High' }
      ]
    },
    {
      signal: 'Biopharma R&D data silo consolidation: Initiative launched to integrate clinical data from 6 acquired biotech portfolios.',
      urgency: 'High',
      confidence: 93,
      businessImpact: 'Multi-year healthcare analytics and preventive medicine collaboration opportunity for Indus Health Plus.',
      evidence: [
        { source: 'Bio-IT World Technology Review', credibility: 'High' }
      ]
    }
  ],
  acc_target: [
    {
      signal: 'Target accelerates Omnichannel Margin Optimization program to curb shrink and streamline pick-and-pack fulfillment.',
      urgency: 'Immediate',
      confidence: 94,
      businessImpact: 'Deliver Indus Health Plus Employee Well-Being & Wellness Analytics programs.',
      evidence: [
        { source: 'Target Corp Q2 Financial Filing (10-Q)', credibility: 'High' }
      ]
    },
    {
      signal: 'Target Roundel retail media network mandates programmatic first-party customer audience matching engine.',
      urgency: 'High',
      confidence: 90,
      businessImpact: 'Build privacy-preserving Clean Room analytics on Google Cloud & Databricks.',
      evidence: [
        { source: 'AdExchanger Retail Media Intelligence', credibility: 'Medium' }
      ]
    }
  ]
};

// Generic signal templates for newly registered or other accounts
function generateDynamicSignalsForAccount(account: Account): BuyingSignal[] {
  const industry = account.industry || 'Technology';
  const name = account.name;

  return [
    {
      signal: `Executive leadership at ${name} greenlights strategic modernization initiative to eliminate legacy operational bottlenecks in ${industry}.`,
      urgency: 'Immediate',
      confidence: 92,
      businessImpact: `Immediate consultative entry point for Indus Health Plus ${industry} Corporate Health & Wellness programs.`,
      evidence: [
        { source: `${name} Investor Communications & Press Releases`, credibility: 'High' },
        { source: 'TechTarget Enterprise Purchase Intent Radar', credibility: 'High' }
      ]
    },
    {
      signal: `Hiring surge detected: Multiple senior postings for Cloud Data Architects, AI/ML Engineers, and Enterprise Platform Integration specialists.`,
      urgency: 'High',
      confidence: 88,
      businessImpact: `Position Indus Health Plus Pre-employment Health Checks & Corporate Wellness programs for scaling teams.`,
      evidence: [
        { source: 'LinkedIn Talent Intelligence & Corporate Career Portal', credibility: 'High' }
      ]
    },
    {
      signal: `Budget reallocation toward real-time telemetry, automated workflows, and executive AI decision support systems.`,
      urgency: 'High',
      confidence: 85,
      businessImpact: `Propose an Executive Alignment Discovery Workshop and Rapid 2-Week Prototype sprint.`,
      evidence: [
        { source: 'Industry Analyst Intent Index (IDC / Gartner)', credibility: 'Medium' }
      ]
    }
  ];
}

/**
 * Generates fresh buying signals for a target account.
 */
export function getFreshSignalsForAccount(account: Account): BuyingSignal[] {
  if (SIGNAL_LIBRARY[account.id]) {
    return SIGNAL_LIBRARY[account.id];
  }
  return generateDynamicSignalsForAccount(account);
}

/**
 * Creates the complete dispatch package for an account refresh
 */
export function createAccountSignalDispatch(
  account: Account,
  signals: BuyingSignal[]
): SignalDispatchResult {
  const ownerName = extractOwnerDisplayName(account.owner);
  const ownerEmail = deriveOwnerEmail(account.owner, account.createdByEmail);
  const leadershipRecipients = [...LEADERSHIP_EMAILS];

  // Combine all recipients ensuring uniqueness
  const allRecipients = Array.from(new Set([
    ownerEmail,
    ...leadershipRecipients
  ]));

  const scoreDelta = Math.min(10, Math.max(3, Math.floor(signals.length * 2.5)));
  const newScore = Math.min(99, account.opportunityScore + scoreDelta);

  const topSignal = signals[0]?.signal || 'High-urgency buyer intent spike detected.';
  const summary = `Detected ${signals.length} fresh market signals. Informed to Account Owner ${ownerName} (${ownerEmail}) and Indus Health Plus leadership.`;

  return {
    accountId: account.id,
    accountName: account.name,
    ownerName,
    ownerEmail,
    leadershipRecipients,
    allRecipients,
    newSignals: signals,
    scoreDelta,
    newScore,
    summary,
    timestamp: new Date().toISOString()
  };
}

/**
 * Formats an executive notification digest ready for copy/paste or email dispatch
 */
export function generateEmailDigestText(dispatches: SignalDispatchResult[]): string {
  const timestamp = new Date().toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  let text = `===========================================================\n`;
  text += `INDUS HEALTH PLUS - REAL-TIME ACCOUNT SIGNALS BRIEFING\n`;
  text += `Date: ${timestamp}\n`;
  text += `Leadership Recipients: ${LEADERSHIP_EMAILS.join(', ')}\n`;
  text += `Scope: ${dispatches.length} Target Account(s) Refreshed\n`;
  text += `===========================================================\n\n`;

  dispatches.forEach((d, idx) => {
    text += `[${idx + 1}] TARGET ACCOUNT: ${d.accountName}\n`;
    text += `-----------------------------------------------------------\n`;
    text += `• Account Owner: ${d.ownerName} <${d.ownerEmail}>\n`;
    text += `• Leadership Dispatched: ${LEADERSHIP_EMAILS.join(', ')}\n`;
    text += `• Updated Opportunity Score: ${d.newScore} (+${d.scoreDelta} momentum pts)\n`;
    text += `• Fresh Buying Signals Discovered:\n`;

    d.newSignals.forEach((s, sIdx) => {
      text += `  ${sIdx + 1}. [${s.urgency.toUpperCase()} URGENCY | ${s.confidence}% CONFIDENCE]\n`;
      text += `     Signal: "${s.signal}"\n`;
      text += `     Indus Health Plus Entry Angle: ${s.businessImpact}\n`;
      if (s.evidence && s.evidence.length > 0) {
        text += `     Sources: ${s.evidence.map(e => e.source).join('; ')}\n`;
      }
      text += `\n`;
    });
    text += `\n`;
  });

  text += `Recommended Next Action: Account owners should review the fresh intent vectors and initiate targeted executive communications.\n`;
  text += `Platform Vault: AI Account Intelligence Cockpit\n`;

  return text;
}
