/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Account, Stakeholder, Research, Document, Opportunity, Template, Activity, ResearchEvidence } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_microsoft',
    name: 'Microsoft Corporation',
    website: 'https://microsoft.com',
    industry: 'Technology & Cloud',
    country: 'United States',
    region: 'North America',
    priority: 'High',
    owner: 'Sarah Jenkins (Enterprise Sales Director)',
    researchDepth: 'Deep',
    researchStatus: 'Completed',
    opportunityScore: 92,
    lastUpdated: '2026-06-29T14:30:00Z',
  },
  {
    id: 'acc_nike',
    name: 'Nike, Inc.',
    website: 'https://nike.com',
    industry: 'Consumer Goods & Retail',
    country: 'United States',
    region: 'North America',
    priority: 'High',
    owner: 'Michael Chang (Key Accounts Manager)',
    researchDepth: 'Standard',
    researchStatus: 'Completed',
    opportunityScore: 84,
    lastUpdated: '2026-06-28T09:15:00Z',
  },
  {
    id: 'acc_pfizer',
    name: 'Pfizer Inc.',
    website: 'https://pfizer.com',
    industry: 'Pharmaceuticals & Biotech',
    country: 'United States',
    region: 'North America',
    priority: 'High',
    owner: 'Sarah Jenkins (Enterprise Sales Director)',
    researchDepth: 'Deep',
    researchStatus: 'In Progress',
    opportunityScore: 78,
    lastUpdated: '2026-06-30T08:45:00Z',
  },
  {
    id: 'acc_target',
    name: 'Target Corporation',
    website: 'https://target.com',
    industry: 'Retail & E-commerce',
    country: 'United States',
    region: 'North America',
    priority: 'Medium',
    owner: 'Robert Vance (Business Development Lead)',
    researchDepth: 'Standard',
    researchStatus: 'Not Started',
    opportunityScore: 65,
    lastUpdated: '2026-06-25T11:20:00Z',
  },
  {
    id: 'acc_intel',
    name: 'Intel Corporation',
    website: 'https://intel.com',
    industry: 'Semiconductors & Hardware',
    country: 'United States',
    region: 'North America',
    priority: 'Medium',
    owner: 'Robert Vance (Business Development Lead)',
    researchDepth: 'Standard',
    researchStatus: 'In Progress',
    opportunityScore: 72,
    lastUpdated: '2026-06-30T09:10:00Z',
  },
  {
    id: 'acc_tesla',
    name: 'Tesla, Inc.',
    website: 'https://tesla.com',
    industry: 'Automotive & Energy',
    country: 'United States',
    region: 'North America',
    priority: 'High',
    owner: 'Michael Chang (Key Accounts Manager)',
    researchDepth: 'Deep',
    researchStatus: 'Completed',
    opportunityScore: 89,
    lastUpdated: '2026-06-27T16:05:00Z',
  },
];

export const INITIAL_STAKEHOLDERS: Stakeholder[] = [
  // Microsoft Stakeholders
  {
    id: 'stk_ms_1',
    accountId: 'acc_microsoft',
    name: 'Judson Althoff',
    title: 'Chief Commercial Officer',
    department: 'Sales & Commercial Operations',
    linkedIn: 'https://linkedin.com/in/judsonalthoff',
    role: 'Decision Maker',
    influence: 'High',
    status: 'Engaged',
  },
  {
    id: 'stk_ms_2',
    accountId: 'acc_microsoft',
    name: 'Kathleen Hogan',
    title: 'Chief People Officer',
    department: 'Human Resources',
    linkedIn: 'https://linkedin.com/in/kathleenhogan',
    role: 'Influencer',
    influence: 'Medium',
    status: 'No Contact',
  },
  {
    id: 'stk_ms_3',
    accountId: 'acc_microsoft',
    name: 'Corey Sanders',
    title: 'VP of Microsoft Cloud for Industry',
    department: 'Cloud & Solutions Architecture',
    linkedIn: 'https://linkedin.com/in/coreysanders',
    role: 'Champion',
    influence: 'High',
    status: 'Contacted',
  },
  {
    id: 'stk_ms_4',
    accountId: 'acc_microsoft',
    name: 'Sarah Bond',
    title: 'President of Xbox',
    department: 'Gaming Division',
    linkedIn: 'https://linkedin.com/in/sarahbond',
    role: 'Influencer',
    influence: 'Medium',
    status: 'No Contact',
  },

  // Nike Stakeholders
  {
    id: 'stk_nk_1',
    accountId: 'acc_nike',
    name: 'John Donahoe',
    title: 'Chief Executive Officer',
    department: 'Executive Leadership',
    linkedIn: 'https://linkedin.com/in/johndonahoe',
    role: 'Decision Maker',
    influence: 'High',
    status: 'No Contact',
  },
  {
    id: 'stk_nk_2',
    accountId: 'acc_nike',
    name: 'Cheryl Miller',
    title: 'VP of Global Digital Platform',
    department: 'Digital Product & Engineering',
    linkedIn: 'https://linkedin.com/in/cherylmiller-nike',
    role: 'Champion',
    influence: 'High',
    status: 'Active',
  },
  {
    id: 'stk_nk_3',
    accountId: 'acc_nike',
    name: 'Matthew Friend',
    title: 'Chief Financial Officer',
    department: 'Finance & Operations',
    linkedIn: 'https://linkedin.com/in/mattfriend',
    role: 'Decision Maker',
    influence: 'High',
    status: 'Contacted',
  },

  // Pfizer Stakeholders
  {
    id: 'stk_pf_1',
    accountId: 'acc_pfizer',
    name: 'Dr. Albert Bourla',
    title: 'Chief Executive Officer',
    department: 'Executive Leadership',
    linkedIn: 'https://linkedin.com/in/albertbourla',
    role: 'Decision Maker',
    influence: 'High',
    status: 'No Contact',
  },
  {
    id: 'stk_pf_2',
    accountId: 'acc_pfizer',
    name: 'Lidia Fonseca',
    title: 'Chief Digital and Technology Officer',
    department: 'Digital Technology & Security',
    linkedIn: 'https://linkedin.com/in/lidiafonseca',
    role: 'Decision Maker',
    influence: 'High',
    status: 'Contacted',
  },

  // Tesla Stakeholders
  {
    id: 'stk_ts_1',
    accountId: 'acc_tesla',
    name: 'Drew Baglino',
    title: 'SVP of Powertrain & Energy Engineering',
    department: 'Engineering & Energy',
    linkedIn: 'https://linkedin.com/in/drewbaglino',
    role: 'Decision Maker',
    influence: 'High',
    status: 'Engaged',
  },
  {
    id: 'stk_ts_2',
    accountId: 'acc_tesla',
    name: 'Karn Budhiraj',
    title: 'VP of Global Supply Chain',
    department: 'Supply Chain Operations',
    linkedIn: 'https://linkedin.com/in/karnbudhiraj',
    role: 'Influencer',
    influence: 'High',
    status: 'Contacted',
  }
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_ms_1',
    accountId: 'acc_microsoft',
    title: 'Cross-Industry GenAI Advisory Program',
    description: 'Provide an executive alignment framework to integrate Indus Health Plus solutions with Microsoft Cloud for Retail & Finance, focusing on pre-integrated AI agents.',
    service: 'Enterprise Strategy Consulting',
    value: '$450,000',
    probability: 75,
  },
  {
    id: 'opp_ms_2',
    accountId: 'acc_microsoft',
    title: 'Copilot Custom Extensibility Accelerator',
    description: 'Design and prototype customized enterprise plugins for Microsoft Copilot tailored to financial services and heavy manufacturing.',
    service: 'Rapid Prototyping & Development',
    value: '$280,000',
    probability: 60,
  },
  {
    id: 'opp_nk_1',
    accountId: 'acc_nike',
    title: 'D2C Hyper-Personalization Engine',
    description: 'Consult on real-time consumer intent mapping in Nike Membership Apps to boost digital sales conversions by 8-12%.',
    service: 'Advanced Analytics & AI Development',
    value: '$650,000',
    probability: 50,
  },
  {
    id: 'opp_ts_1',
    accountId: 'acc_tesla',
    title: 'Gigafactory Supply Chain Intelligence Hub',
    description: 'Co-develop an AI-driven supply risk modeling dashboard to predict commodity bottlenecks 30 days in advance.',
    service: 'Custom Supply Chain Solutions',
    value: '$820,000',
    probability: 40,
  },
  {
    id: 'opp_pf_1',
    accountId: 'acc_pfizer',
    title: 'Clinical Trial Subject Matching Pipeline',
    description: 'Accelerate patient recruitment using secure, LLM-based parsing of electronic health records paired against trial eligibility requirements.',
    service: 'Life Sciences Regulatory AI Integration',
    value: '$1,200,000',
    probability: 30,
  }
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc_ms_1',
    accountId: 'acc_microsoft',
    name: 'Microsoft_ABM_Strategic_Plan_Q3_v2.pdf',
    size: '4.2 MB',
    type: 'PDF',
    uploadedAt: '2026-06-29T15:10:00Z',
    status: 'Completed',
  },
  {
    id: 'doc_ms_2',
    accountId: 'acc_microsoft',
    name: 'IndusHealthPlus_Services_Alignment_Deck.pptx',
    size: '12.8 MB',
    type: 'PPTX',
    uploadedAt: '2026-06-29T16:22:00Z',
    status: 'Completed',
  },
  {
    id: 'doc_nk_1',
    accountId: 'acc_nike',
    name: 'Nike_Digital_D2C_Analysis_2026.pdf',
    size: '3.1 MB',
    type: 'PDF',
    uploadedAt: '2026-06-28T10:45:00Z',
    status: 'Completed',
  },
  {
    id: 'doc_ts_1',
    accountId: 'acc_tesla',
    name: 'Tesla_Supply_Chain_Risk_Report.docx',
    size: '1.8 MB',
    type: 'DOCX',
    uploadedAt: '2026-06-27T17:12:00Z',
    status: 'Completed',
  }
];

export const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'tpl_1',
    name: 'Enterprise GenAI Alignment Pitch',
    type: 'Email',
    description: 'Cold email tailored for C-level digital technology leaders focusing on co-innovation models.',
    content: 'Subject: Co-Innovating on GenAI: Accelerating {Company_Name}\'s Strategic Roadmap\n\nDear {Contact_Name},\n\nI recently reviewed your strategic priorities for {Strategic_Priority_1}, and it is clear that {Company_Name} is leading the frontier in driving enterprise digitization.\n\nAt Indus Health Plus, we specialize in high-impact AI accelerators that align directly with {Industry} leaders. Specifically, we see a massive opportunity for {Company_Name} to leverage our pre-built modules for {Opportunity_Area} which would address current challenges in {Challenge_1}.\n\nWe have compiled a briefing paper mapping our capabilities specifically to your current initiatives. Do you have 15 minutes next Tuesday at 10:00 AM CST for a brief introductory discussion?\n\nSincerely,\n\n{Owner}\nIndus Health Plus Account Intelligence'
  },
  {
    id: 'tpl_2',
    name: 'C-Level LinkedIn Outreach',
    type: 'Email', // We will map under templates
    description: 'Ultra-concise LinkedIn InMail focus on mutual strategic alignment and industry benchmark.',
    content: 'Hi {Contact_Name},\n\nFascinated by your leadership of {Company_Name}\'s push into {Strategic_Priority_1}.\n\nAt Indus Health Plus, we recently completed a benchmark of {Industry} digitization models, specifically looking at how custom agents resolve the bottlenecks in {Challenge_1} you have highlighted.\n\nI would love to send over our customized findings for {Company_Name} if you are open to a brief exchange of thoughts.\n\nBest,\n{Owner}'
  },
  {
    id: 'tpl_3',
    name: 'AI-Enabled Digital Discovery Workshop Agenda',
    type: 'Workshop',
    description: 'A 2-hour intensive framework to align key stakeholder teams on AI roadmap prioritization.',
    content: '# Digital Discovery & AI Roadmap Alignment Workshop\n## Client: {Company_Name}\n\n### Objective:\nAlign executive sponsors, IT leads, and business unit owners on high-probability generative AI use cases, identifying three concrete pilots.\n\n### Agenda:\n1. **00:00 - 00:15 | Welcome & Context Setting**\n   - Introductions and brief overview of Indus Health Plus\'s research on {Company_Name}\'s {Strategic_Priority_1}.\n2. **00:15 - 00:45 | Technology Landscape Benchmark**\n   - Mapping current systems against high-efficiency modern alternatives in {Industry}.\n3. **00:45 - 01:30 | Co-Innovation Ideation & Brainstorm**\n   - Group breakout to map pain points in {Challenge_1} and prioritize potential accelerators.\n4. **01:30 - 01:50 | Prioritization Grid (Value vs. Feasibility)**\n   - Plotting identified pilots on the 2x2 roadmap matrix.\n5. **01:50 - 02:00 | Next Steps & Executive Summary**\n   - Defining pilot scopes, timeline, and Proof of Concept (PoC) checkpoints.'
  },
  {
    id: 'tpl_4',
    name: 'Stakeholder Discovery Deep Dive',
    type: 'Meeting',
    description: 'Core discovery meeting script to dig into specific pain points with departmental champions.',
    content: '## Discovery Script for {Contact_Name} ({Contact_Title})\n\n### Opening (5 mins)\n- Build rapport; acknowledge their recent work or company updates.\n- State goal: "We want to understand the active operational friction points in {Department} to ensure any future pilot is highly targeted."\n\n### Core Discovery Questions (25 mins)\n1. "Regarding your focus on {Strategic_Priority_1}, what has been the primary barrier to accelerating internal adoption?"\n2. "We identified {Challenge_1} as a potential friction point in our industry research. How is that currently manifesting inside your team\'s workflow?"\n3. "If you could automate or inject intelligence into a single process in the next 30 days with zero friction, which would it be?"\n\n### Alignment & Solution Mapping (15 mins)\n- Map their responses live to Indus Health Plus\'s {Recommended_Service}.\n- Describe high-level success story of a peer organization.'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act_1',
    timestamp: '2026-06-30T09:10:00Z',
    type: 'research_started',
    description: 'Sarah Jenkins triggered Deep Research for Pfizer Inc.',
    accountId: 'acc_pfizer',
    accountName: 'Pfizer Inc.'
  },
  {
    id: 'act_2',
    timestamp: '2026-06-29T14:30:00Z',
    type: 'research_completed',
    description: 'AI Agent completed Deep Account Intelligence synthesis for Microsoft Corporation.',
    accountId: 'acc_microsoft',
    accountName: 'Microsoft Corporation'
  },
  {
    id: 'act_3',
    timestamp: '2026-06-28T16:22:00Z',
    type: 'document_uploaded',
    description: 'New alignment deck "IndusHealthPlus_Services_Alignment_Deck.pptx" uploaded to Microsoft Corporation.',
    accountId: 'acc_microsoft',
    accountName: 'Microsoft Corporation'
  },
  {
    id: 'act_4',
    timestamp: '2026-06-28T09:15:00Z',
    type: 'research_completed',
    description: 'AI Agent completed Standard Account Intelligence synthesis for Nike, Inc.',
    accountId: 'acc_nike',
    accountName: 'Nike, Inc.'
  },
  {
    id: 'act_5',
    timestamp: '2026-06-27T14:45:00Z',
    type: 'stakeholder_added',
    description: 'Stakeholder Judson Althoff (Chief Commercial Officer) added to Microsoft Corporation.',
    accountId: 'acc_microsoft',
    accountName: 'Microsoft Corporation'
  },
  {
    id: 'act_6',
    timestamp: '2026-06-26T10:00:00Z',
    type: 'account_created',
    description: 'New target account Target Corporation registered by Robert Vance.',
    accountId: 'acc_target',
    accountName: 'Target Corporation'
  }
];

export const MOCK_RESEARCH_TEMPLATES: Record<string, Research> = {
  acc_microsoft: {
    accountId: 'acc_microsoft',
    overview: 'Microsoft is leading the global artificial intelligence explosion, primarily driven by its massive capital investments in OpenAI and rapid native commercialization of Azure AI Services and Copilot across its entire productivity and business suite. The firm represents an unparalleled partner and client, seeking both strategic co-development opportunities and internal capability expansion.',
    techLandscape: [
      'Microsoft Azure Cloud Platform',
      'Azure OpenAI Service (GPT-4o, Dall-E 3, Embeddings)',
      'Microsoft 365 Copilot & Custom Copilot Studio',
      'Dynamics 365 CRM & ERP Suite',
      'Power Platform (PowerApps, PowerAutomate, PowerBI)',
      'GitHub Copilot Enterprise integration'
    ],
    strategicPriorities: [
      'Scale enterprise AI adoption through Microsoft Cloud for Industry (Retail, Financial Services, Healthcare).',
      'Accelerate Azure Cloud consumption through sovereign cloud and data-residency compliance models globally.',
      'Broaden GitHub Copilot integration deeper into the defense, government, and heavy-regulated sectors.',
      'Establish next-generation Quantum Computing and hybrid-classical architectures.'
    ],
    hiringTrends: [
      'Heavy recruitment for Generative AI Solutions Engineers, specifically focused on defense and healthcare frameworks.',
      'Expanding Strategic Consulting and Client Technology Officer (CTO) roles within key enterprise geographic hubs.',
      'High volumes of postings for LLM Optimization and Edge-AI hardware integration specialists.'
    ],
    latestNews: [
      {
        id: 'news_ms_1',
        date: '2026-06-20',
        title: 'Microsoft Announces Expansion of Sovereign Cloud Framework for EU Public Sector',
        source: 'Azure Industry News'
      },
      {
        id: 'news_ms_2',
        date: '2026-06-15',
        title: 'Satya Nadella Outlines $10B Investment in Secure Datacenters Across Southeast Asia',
        source: 'Wall Street Journal'
      },
      {
        id: 'news_ms_3',
        date: '2026-06-08',
        title: 'Microsoft and Epic Systems Partner to Launch Generative AI Scribing in 150 Additional Hospitals',
        source: 'Healthcare IT News'
      }
    ],
    financialHighlights: [
      { id: 'f_ms_1', metric: 'Total Revenue (TTM)', value: '$245.1B (+16% YoY)' },
      { id: 'f_ms_2', metric: 'Azure & Cloud Growth', value: '31% YoY constant currency' },
      { id: 'f_ms_3', metric: 'Operating Margin', value: '44.6%' },
      { id: 'f_ms_4', metric: 'Cash & Equivalents', value: '$75.5B' }
    ],
    challenges: [
      'High compute costs of running state-of-the-art LLMs impacting margin expansion in Azure AI services.',
      'Enterprise anxiety regarding security and intellectual property boundaries when utilizing Copilot on sensitive datasets.',
      'Severe geopolitical chip-supply friction affecting long-term GPU cluster deployment speeds.'
    ],
    buyingSignals: [
      'Increasing enterprise budget pushback demanding visible ROI proofs for early Copilot and AI subscriptions.',
      'Openly seeking third-party solutions integrators to design highly customized industry-specific templates for PowerPlatform.',
      'Active partner program initiatives aiming to accelerate migration of traditional on-prem SQL workloads to Azure Fabric.'
    ],
    summary: 'Microsoft represents a triple-threat ABM profile: They are an active seller of AI services looking for ecosystem integrators like Indus Health Plus, a potential co-development partner for Cloud for Industry verticals, and an enterprise customer with deep budgets for productivity transformation consulting.'
  },
  acc_nike: {
    accountId: 'acc_nike',
    overview: 'Nike is navigating a massive structural shift back towards wholesale distribution channels after a multi-year direct-to-consumer (D2C) heavy strategy created inventory build-up and diluted local retail partnerships. They are actively seeking AI-driven inventory analytics, demand predicting capabilities, and localized hyper-personalized consumer engagement platforms to revive market share.',
    techLandscape: [
      'Amazon Web Services (AWS) host for core consumer applications',
      'Salesforce Commerce Cloud & Service Cloud',
      'Snowflake Data Cloud for global consumer analytics',
      'Adobe Experience Manager (AEM) for digital asset deployment',
      'Native mobile apps (Nike App, SNKRS, Nike Run Club)'
    ],
    strategicPriorities: [
      'Re-align the retail ecosystem by restoring relationships with Foot Locker and independent tier-1 retail doors.',
      'Enhance digital commerce margins through localized predictive inventory allocation models.',
      'Unify separate consumer data streams across regional apps to drive global cross-selling and membership loyalty.',
      'Introduce generative product customization features into Nike By You studios.'
    ],
    hiringTrends: [
      'Active recruiting for Supply Chain Data Science Leads focusing on real-time routing and freight prediction.',
      'Expanding Retail Digital Experience (RDX) architects to bridge in-store systems with client profiles.',
      'Hiring for Generative Creative Directors to leverage AI tools in seasonal footwear design pipelines.'
    ],
    latestNews: [
      {
        id: 'news_nk_1',
        date: '2026-06-25',
        title: 'Nike Unveils Digital-First Retail Hub in Tokyo Featuring AI-Driven Fit and Styling',
        source: 'Nikkei Retail'
      },
      {
        id: 'news_nk_2',
        date: '2026-06-18',
        title: 'Nike CFO Outlines Multi-Year Supply Chain Efficiency Initiative to Save $2B',
        source: 'Bloomberg Technology'
      }
    ],
    financialHighlights: [
      { id: 'f_nk_1', metric: 'Annual Revenue', value: '$51.2B (+1% YoY)' },
      { id: 'f_nk_2', metric: 'Digital Channel Share', value: '26% of total revenue' },
      { id: 'f_nk_3', metric: 'Gross Margin', value: '44.3% (+120 bps)' }
    ],
    challenges: [
      'High promotional discounting required in previous quarters to flush out stagnant North American retail stock.',
      'Strong, agile competitors (On Running, Hoka) successfully capturing premium runner demographics.',
      'Disjointed customer experience across isolated geographic instances of loyalty databases.'
    ],
    buyingSignals: [
      'Public commitments by leadership to re-engineer regional distribution center software frameworks.',
      'Active RFP for third-party consumer intelligence engines capable of synthesizing social listening with retail inventory trends.',
      'Launch of co-innovation labs in Beaverton designed to partner with early-stage digital retail startups.'
    ],
    summary: 'Nike\'s pain points are clear: Inventory inefficiency, wholesale reconnects, and modern brand competition. Indus Health Plus\'s corporate wellness and preventive health solutions are highly aligned to leadership priorities.'
  },
  acc_tesla: {
    accountId: 'acc_tesla',
    overview: 'Tesla is shifting capital focus from mass-market vehicle production expansions to full autonomous driving technology, artificial intelligence, robotaxi rollouts, and Megapack energy storage units. The firm functions like an elite computing laboratory, demanding highly technical, performant systems architecture.',
    techLandscape: [
      'Proprietary supercomputer clusters (Dojo Platform)',
      'Custom onboard neural networks (FSD Beta Engine)',
      'Tesla OS (highly optimized custom Linux distribution in-vehicle)',
      'Kubernetes cluster infrastructure for fleet telemetry logs',
      'Proprietary ERP system (3-Dog Engine)'
    ],
    strategicPriorities: [
      'Achieve regulatory clearance for Level 4 unsupervised FSD operations across North America.',
      'Scale Megapack battery factory capacities in Shanghai and California to meet surging utility demands.',
      'Incorporate humanoid Optimus robots into secondary assembly line tasks for automated material handling.',
      'Build out cloud monetization layers for Tesla vehicle owners via decentralized computing resources.'
    ],
    hiringTrends: [
      'Massive search for Computer Vision specialists with experience in real-time latency optimization.',
      'Hiring Battery Materials Scientists and Supply Chain Geopoliticians for mining resource alignment.',
      'Active hiring for Edge-Infra Software Engineers to manage vehicle fleet API traffic at scale.'
    ],
    latestNews: [
      {
        id: 'news_ts_1',
        date: '2026-06-26',
        title: 'Tesla Delivers First Fleet of 100 Megapacks to Southern California Edison Storage Substation',
        source: 'CleanTechnica'
      },
      {
        id: 'news_ts_2',
        date: '2026-06-14',
        title: 'Optimus Robot Completes 100-Hour Autonomous Logistics Run at Texas Gigafactory',
        source: 'Automotive News'
      }
    ],
    financialHighlights: [
      { id: 'f_ts_1', metric: 'Total Revenue (TTM)', value: '$98.4B' },
      { id: 'f_ts_2', metric: 'Energy Storage Revenue', value: '$6.4B (+88% YoY)' },
      { id: 'f_ts_3', metric: 'Capital Expenditure', value: '$11.5B (primarily AI clusters)' }
    ],
    challenges: [
      'Slowing global EV sales growth forcing severe price wars and reducing operating margins.',
      'Complex regulatory pathways for autonomous operations causing rolling delays in public robotaxi launches.',
      'Vulnerability to raw mineral resource prices (Lithium, Nickel, Cobalt).'
    ],
    buyingSignals: [
      'Expansion of corporate venture investing in external software frameworks managing decentralized energy grids.',
      'Intense focus on automated logistics software as supply chain complexity spreads across three continents.',
      'Strategic interest in edge-computing security layers as the vehicle fleet expands as a target for cyber threats.'
    ],
    summary: 'Tesla does not buy standard off-the-shelf business consulting. Indus Health Plus can only win accounts through elite engineering partnerships, supply chain prediction accelerators, or edge-security co-innovation.'
  }
};

export const INITIAL_EVIDENCE: ResearchEvidence[] = [
  // Microsoft Evidence
  {
    id: 'ev_ms_1',
    accountId: 'acc_microsoft',
    title: 'Microsoft 2025 Annual Report (Form 10-K)',
    source: 'SEC EDGAR',
    sourceType: 'Annual Report',
    url: 'https://www.sec.gov/Archives/edgar/data/789019/000156459024010156/msft-10k_20240630.htm',
    date: '2025-07-28',
    category: 'Financials & Strategy',
    content: 'Our cloud platform Azure grew 30% YoY, driven by significant adoption of Azure OpenAI and Azure Fabric services. Capital expenditures on GPU cluster installations and next-generation datacenter power initiatives increased to $14B to support massive LLM inference workloads.',
    summary: 'Details substantial GPU infrastructure investments ($14B CAPEX) and Azure growth driven by Azure OpenAI adoption.',
    confidence: 98,
    status: 'Completed',
    tags: ['Azure', 'CAPEX', 'Generative AI', 'SEC Filing'],
    freshness: 'High',
    reliability: 'High',
    overallQuality: 'A+'
  },
  {
    id: 'ev_ms_2',
    accountId: 'acc_microsoft',
    title: 'Careers Portal: Senior Principal Architect - Generative AI Solutions',
    source: 'Microsoft Careers',
    sourceType: 'Job Posting',
    url: 'https://careers.microsoft.com/jobs/senior-principal-architect-genai',
    date: '2026-06-15',
    category: 'Hiring & Org',
    content: 'We are seeking an expert Solutions Architect to lead enterprise client migrations for Azure OpenAI and custom agents. Requires expert proficiency with PyTorch, Rust, and Azure Security architectures. Must design value-proof dashboards for Copilot licenses.',
    summary: 'Points to a hiring push for architects specialized in custom enterprise agents and proving Copilot license ROI.',
    confidence: 95,
    status: 'Completed',
    tags: ['Hiring', 'Copilot ROI', 'PyTorch', 'Rust'],
    freshness: 'High',
    reliability: 'High',
    overallQuality: 'A'
  },
  {
    id: 'ev_ms_3',
    accountId: 'acc_microsoft',
    title: 'Company Blog: Introducing Sovereign Cloud Compliance for EU Public Sector',
    source: 'Microsoft Official Blog',
    sourceType: 'Website',
    url: 'https://blogs.microsoft.com/sovereign-cloud-eu-compliance',
    date: '2026-06-20',
    category: 'Product & Press',
    content: 'Microsoft is expanding its Sovereign Cloud framework. The new updates ensure isolated datacenter zones in France, Germany, and Singapore, strictly keeping administrative telemetry and citizen data within local boundaries.',
    summary: 'Press announcement for EU sovereign cloud zones supporting high-security public sector migrations.',
    confidence: 92,
    status: 'Completed',
    tags: ['Sovereign Cloud', 'EU Compliance', 'Products'],
    freshness: 'High',
    reliability: 'High',
    overallQuality: 'A'
  },
  {
    id: 'ev_ms_4',
    accountId: 'acc_microsoft',
    title: 'User Note: Sarah\'s Client Feedback from Azure Partner Network',
    source: 'Sarah Jenkins (Direct Source)',
    sourceType: 'Manual Note',
    date: '2026-06-29',
    category: 'Client Feedback',
    content: 'Spoke with partners. They mention enterprise buyers are complaining about difficulty in quantifying exact Copilot productivity gains. This represents a perfect consulting entry point for us.',
    summary: 'Partner feedback showing standard Copilot ROI measuring is a major pain point for buyers.',
    confidence: 90,
    status: 'Completed',
    tags: ['Client Pain Point', 'Copilot ROI', 'Consulting Strategy'],
    freshness: 'High',
    reliability: 'High',
    overallQuality: 'A'
  },
  {
    id: 'ev_ms_5',
    accountId: 'acc_microsoft',
    title: 'Microsoft_ABM_Strategic_Plan_Q3_v2.pdf',
    source: 'Uploaded Document',
    sourceType: 'Document',
    date: '2026-06-29',
    category: 'Internal Strategy',
    content: 'Internal ABM prioritization maps multi-cloud target segments for Power Platform custom extensibility. Budget allocated for pre-built flow connectors to bridge manual billing bottlenecks outside core Dynamics 365 ERP.',
    summary: 'Strategy document detailing segments for Power Platform plugins and custom flow connectors.',
    confidence: 96,
    status: 'Completed',
    tags: ['Uploaded Document', 'Power Platform', 'ABM Strategy'],
    freshness: 'High',
    reliability: 'High',
    overallQuality: 'A+'
  },
  {
    id: 'ev_ms_6',
    accountId: 'acc_microsoft',
    title: 'Q3 Investor Transcript: Satya Nadella on Sovereign Hegemony',
    source: 'Investor Relations',
    sourceType: 'Investor Presentation',
    url: 'https://www.microsoft.com/investor/earnings/FY26-Q3/transcript.aspx',
    date: '2026-04-26',
    category: 'Financials & Strategy',
    content: 'Satya Nadella: "We are seeing strong momentum for sovereign clouds, particularly in highly regulated markets. Our focus is on offering complete digital sovereignty alongside our hyperscale capabilities, securing multi-year agency commits."',
    summary: 'CEO comments on driving sovereign cloud expansions in highly regulated jurisdictions.',
    confidence: 97,
    status: 'Completed',
    tags: ['Sovereign Cloud', 'Satya Nadella', 'Investor Q&A'],
    freshness: 'Medium',
    reliability: 'High',
    overallQuality: 'A+'
  },

  // Nike Evidence
  {
    id: 'ev_nk_1',
    accountId: 'acc_nike',
    title: 'Nike Q4 2025 Investor Letter',
    source: 'Nike Investor Relations',
    sourceType: 'Investor Presentation',
    date: '2025-06-26',
    category: 'Financials & Strategy',
    content: 'We are instituting a $2B multi-year cost containment savings program. Priorities include upgrading our global supply logistics demand-prediction engines and connecting disparate local customer e-commerce databases into a unified loyalty ledger.',
    summary: 'Investor communication highlighting a $2B efficiency mandate, demand prediction focus, and customer database consolidation.',
    confidence: 94,
    status: 'Completed',
    tags: ['Mandate', 'Logistics', 'Customer Ledger'],
    freshness: 'Medium',
    reliability: 'High',
    overallQuality: 'A'
  },
  {
    id: 'ev_nk_2',
    accountId: 'acc_nike',
    title: 'Nike_Digital_D2C_Analysis_2026.pdf',
    source: 'Uploaded Document',
    sourceType: 'Document',
    date: '2026-06-28',
    category: 'Internal Strategy',
    content: 'Our D2C channel personalization models show high drop-off rates on mobile due to disconnected loyalty databases across region stores. Recommended action is building an isolated personalization API proxy to test in Tokyo pilot stores.',
    summary: 'Consulting audit indicating high drop-offs on mobile and proposing a Tokyo personalization pilot.',
    confidence: 95,
    status: 'Completed',
    tags: ['D2C', 'Personalization', 'Tokyo Pilot'],
    freshness: 'High',
    reliability: 'High',
    overallQuality: 'A'
  },
  {
    id: 'ev_nk_3',
    accountId: 'acc_nike',
    title: 'Careers Portal: Lead Data Scientist - Predictive Operations',
    source: 'Nike Careers',
    sourceType: 'Job Posting',
    date: '2026-06-18',
    category: 'Hiring & Org',
    content: 'Seeking an expert Lead Data Scientist to join Beaverton operations. Must develop demand forecasting engines using Snowflake databases, AWS nodes, and custom Python forecasting blocks. Experience in fashion shelf-latency minimization is a plus.',
    summary: 'Headcount expansion for predictive logistics models built on AWS and Snowflake.',
    confidence: 91,
    status: 'Completed',
    tags: ['Hiring', 'AWS', 'Snowflake', 'Forecasting'],
    freshness: 'High',
    reliability: 'High',
    overallQuality: 'A'
  },

  // Pfizer Evidence
  {
    id: 'ev_pf_1',
    accountId: 'acc_pfizer',
    title: 'Pfizer ESG Report & Seagen Integration Briefing',
    source: 'Pfizer Investor Relations',
    sourceType: 'Annual Report',
    date: '2026-03-12',
    category: 'Strategy & Compliance',
    content: 'Integrating Seagen represents our largest oncology priority. We are deploying AWS HealthLake nodes to securely index external pre-clinical clinical datasets, ensuring complete auditability and compliance with regional clinical trial guidelines.',
    summary: 'Detailed description of oncology data ingestion using AWS HealthLake to support the Seagen integration.',
    confidence: 93,
    status: 'Completed',
    tags: ['Seagen Integration', 'Oncology', 'AWS HealthLake'],
    freshness: 'Medium',
    reliability: 'High',
    overallQuality: 'A'
  },
  {
    id: 'ev_pf_2',
    accountId: 'acc_pfizer',
    title: 'Pfizer Careers: Staff Research Scientist (Oncology Compliance AI)',
    source: 'Pfizer Careers',
    sourceType: 'Job Posting',
    date: '2026-06-22',
    category: 'Hiring & Org',
    content: 'Looking for an AI Scientist to build custom LLM parsing templates for clinical research trials. The platform must operate fully inside our isolated AWS virtual private clouds, ensuring zero external leakage of sensitive pre-clinical records.',
    summary: 'Hiring profile showing interest in secure, isolated custom AI parsers for pre-clinical documents.',
    confidence: 92,
    status: 'Completed',
    tags: ['Hiring', 'Clinical Trials', 'Isolated LLM'],
    freshness: 'High',
    reliability: 'High',
    overallQuality: 'A'
  }
];
