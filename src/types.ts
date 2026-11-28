/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PriorityType = 'Low' | 'Medium' | 'High';
export type ResearchDepthType = 'Basic' | 'Standard' | 'Deep';
export type ResearchStatusType = 'Not Started' | 'In Progress' | 'Completed';
export type StakeholderRoleType = 'Decision Maker' | 'Influencer' | 'Gatekeeper' | 'Champion' | 'End User';
export type StakeholderInfluenceType = 'Low' | 'Medium' | 'High';
export type StakeholderStatusType = 'Active' | 'Contacted' | 'Engaged' | 'No Contact';

export interface Account {
  id: string;
  name: string;
  website: string;
  industry: string;
  country: string;
  region: string;
  priority: PriorityType;
  owner: string;
  researchDepth: ResearchDepthType;
  researchStatus: ResearchStatusType;
  opportunityScore: number;
  lastUpdated: string;
  createdByEmail?: string;
  sharedWith?: string[];
}

export interface StakeholderIntelligence {
  basicInformation?: {
    name: string;
    title: string;
    department: string;
    location: string;
    email?: string;
    company?: string;
  };
  roleAssessment?: {
    persona: string;
    decisionAuthority: string;
    technicalInfluence: string;
    businessInfluence: string;
  };
  likelyKPIs?: string[];
  businessChallenges?: string[];
  technologyFocus?: string[];
  likelyPriorities?: string[];
  communicationStyle?: string;
  recommendedApproach?: string;
  recommendedQuestions?: string[];
  recommendedIndusSolutions?: { solution: string; whyRelevant: string }[];
  confidence?: number;
  evidence?: string[];
  influenceScore?: number;
  decisionPower?: {
    budgetAuthority: string;
    technicalAuthority: string;
    businessAuthority: string;
    overallDecisionPower: string;
  };
  engagementStrategy?: {
    bestOpeningConversation: string;
    businessAngle: string;
    technologyAngle: string;
    recommendedWorkshop: string;
    relevantAccelerator: string;
    relevantCaseStudy: string;
    likelyObjections: string[];
    suggestedNextMeeting: string;
  };
  discoveryQuestions?: string[];
  communicationPreview?: {
    executiveEmail: string;
    linkedInConnectionRequest: string;
    linkedInFollowUp: string;
    workshopInvitation: string;
    meetingAgenda: string;
    discoveryCallAgenda: string;
  };
}

export interface Stakeholder {
  id: string;
  accountId: string;
  name: string;
  title: string;
  department: string;
  linkedIn: string;
  role: StakeholderRoleType;
  influence: StakeholderInfluenceType;
  status: StakeholderStatusType;
  email?: string;
  company?: string;
  notes?: string;
  relationshipStatus?: 'Champion' | 'Warm' | 'Cold' | 'Unknown';
  reportsTo?: string;
  intelligence?: StakeholderIntelligence;
  lastUpdated?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  read: boolean;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'research' | 'signal';
  accountId?: string;
  accountName?: string;
  recipients?: string[];
  signals?: BuyingSignal[];
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  source: string;
  url?: string;
}

export interface FinancialMetric {
  id: string;
  metric: string;
  value: string;
}

export interface Research {
  accountId: string;
  overview: string;
  techLandscape: string[];
  strategicPriorities: string[];
  hiringTrends: string[];
  latestNews: NewsItem[];
  financialHighlights: FinancialMetric[];
  challenges: string[];
  buyingSignals: string[];
  summary: string;
}

export interface Document {
  id: string;
  accountId: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  status: 'Uploading' | 'Queued' | 'Processing' | 'Completed' | 'Failed';
  extractedText?: string;
  aiSummary?: string;
  detectedTopics?: string[];
  detectedTechnologies?: string[];
  detectedBusinessPriorities?: string[];
  metadata?: {
    author?: string;
    pageCount?: number;
    fileSize?: string;
    sections?: { heading: string; content: string }[];
    tables?: { title: string; headers: string[]; rows: string[][] }[];
  };
}

export interface Opportunity {
  id: string;
  accountId: string;
  title: string;
  description: string;
  service: string;
  value: string;
  probability: number; // 0 to 100
}

export interface Communication {
  id: string;
  accountId: string;
  type: 'Cold Email' | 'LinkedIn Message' | 'Meeting Agenda' | 'Workshop Invite' | 'Discovery Questions';
  title: string;
  content: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'Email' | 'Workshop' | 'Meeting' | 'Prompt';
  description: string;
  content: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  type: 'account_created' | 'research_started' | 'research_completed' | 'stakeholder_added' | 'document_uploaded' | 'opportunity_created' | 'settings_updated' | 'evidence_collected';
  description: string;
  accountId?: string;
  accountName?: string;
}

export interface AppSettings {
  aiProvider: 'Gemini' | 'OpenAI' | 'Claude';
  geminiApiKey: string;
  modelSelection: string;
  defaultResearchDepth: ResearchDepthType;
  theme: 'Light' | 'Dark';
}

// ========================================================
// AI RESEARCH ORCHESTRATION LAYER DATA MODELS
// ========================================================

export type ModuleStatus = 'Not Started' | 'Running' | 'Completed' | 'Failed' | 'Skipped';

export interface ModuleProgress {
  id: string;
  name: string;
  status: ModuleStatus;
  confidence: number; // 0 to 100
  estimatedDuration: number; // in seconds
  error?: string;
  updatedAt: string;
}

export interface InsightEvidence {
  source: string;
  url?: string;
  credibility: 'High' | 'Medium' | 'Low';
  quote?: string;
}

export interface ResearchEvidence {
  id: string;
  accountId: string;
  title: string;
  source: string;
  sourceType: 'Website' | 'Annual Report' | 'Quarterly Report' | 'Investor Presentation' | 'News' | 'Job Posting' | 'Document' | 'Manual Note';
  url?: string;
  date: string;
  category: string;
  content: string;
  summary: string;
  confidence: number; // 0 to 100
  status: 'Uploading' | 'Queued' | 'Processing' | 'Completed' | 'Failed';
  tags: string[];
  freshness: 'High' | 'Medium' | 'Low';
  reliability: 'High' | 'Medium' | 'Low';
  overallQuality: 'A+' | 'A' | 'B' | 'C' | 'D';
}

export interface CompanyResearch {
  legalName: string;
  founded: string;
  employees: string;
  headquarters: string;
  description: string;
  sectors: string[];
  competitors: string[];
}

export interface BusinessAnalysis {
  marketPosition: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  keyOfferings: string[];
}

export interface TechnologyFinding {
  technology: string;
  category: 'Cloud' | 'Data Platform' | 'Analytics' | 'AI' | 'ERP' | 'CRM' | 'BI' | 'Integration';
  confidence: number;
  businessImpact: string;
  evidence: InsightEvidence[];
}

export interface NewsItemInsight {
  id: string;
  title: string;
  date: string;
  source: string;
  url?: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  impact: string;
}

export interface HiringInsight {
  openRoleCount: number;
  focusAreas: string[];
  skillsInDemand: string[];
  trends: string[];
  evidence: InsightEvidence[];
}

export interface FinancialInsight {
  fiscalYear: string;
  revenue: string;
  netIncome: string;
  growthRate: string;
  rdSpend: string;
  digitalBudgetEst: string;
  metrics: { metric: string; value: string; trend: 'Up' | 'Down' | 'Flat' }[];
}

export interface BusinessPriority {
  priority: string;
  timeline: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  details: string;
  evidence: InsightEvidence[];
}

export interface BuyingSignal {
  signal: string;
  urgency: 'Immediate' | 'High' | 'Medium' | 'Low';
  confidence: number;
  businessImpact: string;
  evidence: InsightEvidence[];
}

export interface DigitalMaturity {
  scores: {
    cloud: number;
    ai: number;
    dataPlatform: number;
    security: number;
    devops: number;
  };
  overall: number;
  assessment: string;
}

export interface OpportunityMapping {
  opportunity: string;
  confidence: number;
  priority: 'High' | 'Medium' | 'Low';
  recommendedOffering: string;
  estimatedBusinessValue: string;
  suggestedWorkshop: string;
  suggestedAccelerator: string;
  suggestedDiscoveryQuestions: string[];
}

export interface ExecutiveSummary {
  businessSummary: string;
  technologySummary: string;
  currentInitiatives: string[];
  keyRisks: string[];
  keyOpportunities: string[];
  recommendedStrategy: string;
  recommendedIndusServices?: string[];
  overallConfidence: number;
}

export interface OpportunityScoringFactors {
  technologyFit: number;
  businessTransformation: number;
  cloudAdoption: number;
  aiInvestments: number;
  hiringTrends: number;
  dataModernization: number;
  buyingSignals: number;
  recentNews: number;
  financialGrowth: number;
  leadershipDirection: number;
}

export interface ResearchCoverage {
  website: number; // 0 to 100
  leadership: number; // 0 to 100
  products: number; // 0 to 100
  technology: number; // 0 to 100
  hiring: number; // 0 to 100
  annualReport: number; // 0 to 100
  quarterlyReport: number; // 0 to 100
  investorPresentation: number; // 0 to 100
  uploadedDocuments: number; // 0 to 100
  manualNotes: number; // 0 to 100
  news: number; // 0 to 100
  overallScore: number; // 0 to 100
}

export interface HeadcountLocation {
  location: string;
  city: string;
  country: string;
  officeType: string;
  headcount: string;
  notes?: string;
}

export interface HeadcountDistribution {
  totalEmployees: string;
  numericTotal: number;
  asOfDate: string;
  locations: HeadcountLocation[];
  branchSummary: string;
}

export interface EngagementProgram {
  name: string;
  category: string;
  description: string;
  targetAudience?: string;
}

export interface EmployeeEngagement {
  summary: string;
  programs: EngagementProgram[];
  existingPlatformsOrPartners: string[];
}

export interface PreEmploymentChecks {
  required: string;
  processSummary: string;
  mandatoryTests: string[];
  onboardingProtocol: string;
  evidenceSources: string[];
}

export interface AnnualHealthChecks {
  offered: string;
  cadence: string;
  eligibility: string;
  packageScope: string[];
  currentDiagnosticPartner: string;
  renewalWindow: string;
}

export interface OnsiteHealthCamps {
  active: string;
  activities: string[];
  frequency: string;
  recentExamples: string[];
}

export interface WellnessBudget {
  disclosedBudget: string;
  sourceType: 'Disclosed in Report' | 'AI Benchmark Estimate';
  numericHeadcountUsed: number;
  benchmarkRatePerEmployeeINR: number;
  estimatedTotalAnnualSpendINR: string;
  estimationRationale: string;
}

export interface HRKeyContact {
  name: string;
  title: string;
  roleCategory: string;
  decisionPower: string;
  focusArea: string;
  source?: string;
}

export interface HROrgStructure {
  teamSizeEstimate: string;
  structureSummary: string;
  keyContacts: HRKeyContact[];
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface OrchestratedResearch {
  accountId: string;
  pipeline: Record<string, ModuleProgress>;
  scoring: {
    factors: OpportunityScoringFactors;
    overallScore: number;
  };
  coverage: ResearchCoverage;
  researchQuality?: 'A+' | 'A' | 'B' | 'C' | 'D';
  data: {
    company?: CompanyResearch;
    business?: BusinessAnalysis;
    technology?: {
      summary: string;
      findings: TechnologyFinding[];
    };
    news?: NewsItemInsight[];
    hiring?: HiringInsight;
    financial?: FinancialInsight;
    strategic?: BusinessPriority[];
    signals?: BuyingSignal[];
    maturity?: DigitalMaturity;
    opportunities?: OpportunityMapping[];
    executive?: ExecutiveSummary;
    headcountDistribution?: HeadcountDistribution;
    employeeEngagement?: EmployeeEngagement;
    preEmploymentChecks?: PreEmploymentChecks;
    annualHealthChecks?: AnnualHealthChecks;
    onsiteHealthCamps?: OnsiteHealthCamps;
    wellnessBudget?: WellnessBudget;
    hrOrgStructure?: HROrgStructure;
    groundingSources?: GroundingSource[];
  };
}
