/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrchestratedResearch, ModuleProgress } from './types';

// Helper to generate the default pipeline progress for completed research
export const getCompletedPipeline = (updatedAt: string): Record<string, ModuleProgress> => ({
  evidence: { id: 'evidence', name: 'Evidence Collection', status: 'Completed', confidence: 98, estimatedDuration: 0, updatedAt },
  company: { id: 'company', name: 'Company Discovery', status: 'Completed', confidence: 98, estimatedDuration: 0, updatedAt },
  business: { id: 'business', name: 'Business Analysis', status: 'Completed', confidence: 95, estimatedDuration: 0, updatedAt },
  technology: { id: 'technology', name: 'Technology Detection', status: 'Completed', confidence: 92, estimatedDuration: 0, updatedAt },
  news: { id: 'news', name: 'News Analysis', status: 'Completed', confidence: 88, estimatedDuration: 0, updatedAt },
  hiring: { id: 'hiring', name: 'Hiring Analysis', status: 'Completed', confidence: 90, estimatedDuration: 0, updatedAt },
  financial: { id: 'financial', name: 'Financial Analysis', status: 'Completed', confidence: 94, estimatedDuration: 0, updatedAt },
  strategic: { id: 'strategic', name: 'Strategic Priorities', status: 'Completed', confidence: 92, estimatedDuration: 0, updatedAt },
  signals: { id: 'signals', name: 'Buying Signals', status: 'Completed', confidence: 86, estimatedDuration: 0, updatedAt },
  maturity: { id: 'maturity', name: 'Digital Maturity', status: 'Completed', confidence: 90, estimatedDuration: 0, updatedAt },
  opportunities: { id: 'opportunities', name: 'Opportunity Mapping', status: 'Completed', confidence: 89, estimatedDuration: 0, updatedAt },
  executive: { id: 'executive', name: 'Executive Summary', status: 'Completed', confidence: 95, estimatedDuration: 0, updatedAt },
});

export const getNotStartedPipeline = (): Record<string, ModuleProgress> => ({
  evidence: { id: 'evidence', name: 'Evidence Collection', status: 'Not Started', confidence: 0, estimatedDuration: 2.0, updatedAt: '' },
  company: { id: 'company', name: 'Company Discovery', status: 'Not Started', confidence: 0, estimatedDuration: 1.5, updatedAt: '' },
  business: { id: 'business', name: 'Business Analysis', status: 'Not Started', confidence: 0, estimatedDuration: 2.0, updatedAt: '' },
  technology: { id: 'technology', name: 'Technology Detection', status: 'Not Started', confidence: 0, estimatedDuration: 2.5, updatedAt: '' },
  news: { id: 'news', name: 'News Analysis', status: 'Not Started', confidence: 0, estimatedDuration: 2.0, updatedAt: '' },
  hiring: { id: 'hiring', name: 'Hiring Analysis', status: 'Not Started', confidence: 0, estimatedDuration: 1.5, updatedAt: '' },
  financial: { id: 'financial', name: 'Financial Analysis', status: 'Not Started', confidence: 0, estimatedDuration: 2.5, updatedAt: '' },
  strategic: { id: 'strategic', name: 'Strategic Priorities', status: 'Not Started', confidence: 0, estimatedDuration: 2.0, updatedAt: '' },
  signals: { id: 'signals', name: 'Buying Signals', status: 'Not Started', confidence: 0, estimatedDuration: 1.5, updatedAt: '' },
  maturity: { id: 'maturity', name: 'Digital Maturity', status: 'Not Started', confidence: 0, estimatedDuration: 1.5, updatedAt: '' },
  opportunities: { id: 'opportunities', name: 'Opportunity Mapping', status: 'Not Started', confidence: 0, estimatedDuration: 2.5, updatedAt: '' },
  executive: { id: 'executive', name: 'Executive Summary', status: 'Not Started', confidence: 0, estimatedDuration: 2.0, updatedAt: '' },
});

export const getInProgressPipeline = (): Record<string, ModuleProgress> => ({
  evidence: { id: 'evidence', name: 'Evidence Collection', status: 'Completed', confidence: 95, estimatedDuration: 0, updatedAt: new Date().toISOString() },
  company: { id: 'company', name: 'Company Discovery', status: 'Completed', confidence: 95, estimatedDuration: 0, updatedAt: new Date().toISOString() },
  business: { id: 'business', name: 'Business Analysis', status: 'Completed', confidence: 91, estimatedDuration: 0, updatedAt: new Date().toISOString() },
  technology: { id: 'technology', name: 'Technology Detection', status: 'Running', confidence: 0, estimatedDuration: 2.0, updatedAt: new Date().toISOString() },
  news: { id: 'news', name: 'News Analysis', status: 'Not Started', confidence: 0, estimatedDuration: 2.0, updatedAt: '' },
  hiring: { id: 'hiring', name: 'Hiring Analysis', status: 'Not Started', confidence: 0, estimatedDuration: 1.5, updatedAt: '' },
  financial: { id: 'financial', name: 'Financial Analysis', status: 'Not Started', confidence: 0, estimatedDuration: 2.5, updatedAt: '' },
  strategic: { id: 'strategic', name: 'Strategic Priorities', status: 'Not Started', confidence: 0, estimatedDuration: 2.0, updatedAt: '' },
  signals: { id: 'signals', name: 'Buying Signals', status: 'Not Started', confidence: 0, estimatedDuration: 1.5, updatedAt: '' },
  maturity: { id: 'maturity', name: 'Digital Maturity', status: 'Not Started', confidence: 0, estimatedDuration: 1.5, updatedAt: '' },
  opportunities: { id: 'opportunities', name: 'Opportunity Mapping', status: 'Not Started', confidence: 0, estimatedDuration: 2.5, updatedAt: '' },
  executive: { id: 'executive', name: 'Executive Summary', status: 'Not Started', confidence: 0, estimatedDuration: 2.0, updatedAt: '' },
});

export const INITIAL_ORCHESTRATED_RESEARCH: Record<string, OrchestratedResearch> = {
  acc_microsoft: {
    accountId: 'acc_microsoft',
    pipeline: getCompletedPipeline('2026-06-29T14:30:00Z'),
    scoring: {
      overallScore: 92,
      factors: {
        technologyFit: 96,
        businessTransformation: 94,
        cloudAdoption: 98,
        aiInvestments: 99,
        hiringTrends: 92,
        dataModernization: 95,
        buyingSignals: 88,
        recentNews: 90,
        financialGrowth: 93,
        leadershipDirection: 95,
      }
    },
    coverage: {
      website: 100,
      leadership: 100,
      products: 100,
      technology: 100,
      hiring: 100,
      annualReport: 100,
      quarterlyReport: 90,
      investorPresentation: 100,
      uploadedDocuments: 100,
      manualNotes: 80,
      news: 100,
      overallScore: 98,
    },
    researchQuality: 'A+',
    data: {
      company: {
        legalName: 'Microsoft Corporation',
        founded: '1975',
        employees: '221,000+',
        headquarters: 'Redmond, Washington, US',
        description: 'A global technology giant specializing in cloud computing, software, AI development, personal computing, and hardware. Currently leading the world\'s enterprise generative AI deployment through Azure OpenAI and the Copilot ecosystem.',
        sectors: ['SaaS', 'Cloud Infrastructure', 'Enterprise Software', 'AI & Machine Learning'],
        competitors: ['Amazon Web Services', 'Google Cloud Platform', 'Apple', 'Meta', 'Salesforce'],
      },
      business: {
        marketPosition: 'Global Co-Leader in Public Cloud and Dominant Provider of Enterprise Productivity Software. Holds a massive first-mover advantage in commercializing LLMs in everyday business workflows.',
        swot: {
          strengths: [
            'Dominant market position in office productivity (Office 365) and OS (Windows)',
            'Strong cloud growth led by Azure OpenAI services',
            'Strategic multi-billion dollar investment in OpenAI',
            'Strong balance sheet with $75.5B cash reserves',
          ],
          weaknesses: [
            'High operational margins vulnerable to GPU cluster deployment/power bottleneck costs',
            'Complex integration across sprawling legacy enterprise product lines',
            'Perceived vendor lock-in risks for massive multi-cloud enterprises',
          ],
          opportunities: [
            'Expansion of sovereign clouds in EU/regulated markets',
            'Slicing AI compute costs with proprietary custom silicon (Maia & Cobalt chips)',
            'Deepening industry-specific pre-integrated agentic workflows',
          ],
          threats: [
            'Geopolitical tensions limiting semiconductor and hardware logistics',
            'Intense competition from Google Cloud Vertex AI and AWS Bedrock',
            'Evolving global regulations regarding security, copyright, and safe AI use',
          ]
        },
        keyOfferings: ['Azure Cloud', 'Microsoft 365 Copilot', 'Power Platform', 'Dynamics 365', 'GitHub Enterprise'],
      },
      technology: {
        summary: 'Microsoft runs on an industry-leading hyper-scale cloud infrastructure with fully integrated advanced database management services, high-performance computing clusters, and multi-tier network topologies.',
        findings: [
          {
            technology: 'Azure OpenAI Service',
            category: 'AI',
            confidence: 99,
            businessImpact: 'Enables real-time inference and enterprise-grade LLM integrations on private data clusters.',
            evidence: [{ source: 'Azure Public Documentation & Press Releases', credibility: 'High' }]
          },
          {
            technology: 'Azure Fabric',
            category: 'Data Platform',
            confidence: 95,
            businessImpact: 'Unifies disparate data lakes and simplifies analytics workloads for reporting dashboards.',
            evidence: [{ source: 'Build 2026 Keynote & Tech Briefings', credibility: 'High' }]
          },
          {
            technology: 'Power BI',
            category: 'BI',
            confidence: 98,
            businessImpact: 'Provides business intelligence and self-serve reporting capabilities across all internal segments.',
            evidence: [{ source: 'Internal Job Postings & Case Studies', credibility: 'High' }]
          },
          {
            technology: 'AWS (Secondary Cloud)',
            category: 'Cloud',
            confidence: 85,
            businessImpact: 'Maintained for developer sandbox environments and strategic multi-cloud redundancies.',
            evidence: [{ source: 'Engineering LinkedIn profiles & tech blogs', credibility: 'Medium' }]
          }
        ]
      },
      news: [
        {
          id: 'news_ms_1',
          title: 'Microsoft Announces Expansion of Sovereign Cloud Framework for EU Public Sector',
          date: '2026-06-20',
          source: 'Azure Industry News',
          sentiment: 'Positive',
          impact: 'Unlocks massive pipeline inside public sector accounts across EU member states.',
        },
        {
          id: 'news_ms_2',
          title: 'Satya Nadella Outlines $10B Investment in Secure Datacenters Across Southeast Asia',
          date: '2026-06-15',
          source: 'Wall Street Journal',
          sentiment: 'Positive',
          impact: 'Establishes unmatched physical cloud presence in emerging markets.',
        }
      ],
      hiring: {
        openRoleCount: 1450,
        focusAreas: ['Generative AI Solutions Engineering', 'Sovereign Cloud Compliance', 'Hardware Edge-AI Co-Design'],
        skillsInDemand: ['PyTorch', 'Rust', 'Kubernetes', 'LLM Fine-Tuning', 'Azure Security Architecture'],
        trends: [
          'High concentration of postings for Technical Client Directors to navigate multi-million dollar cloud migrations.',
          'Increasing headcount for custom ASIC silicon optimization teams in Redmond.',
        ],
        evidence: [{ source: 'Microsoft Careers Portal', credibility: 'High' }]
      },
      financial: {
        fiscalYear: 'FY2026 Q3 TTM',
        revenue: '$245.1B',
        netIncome: '$86.2B',
        growthRate: '+16% YoY',
        rdSpend: '$29.5B',
        digitalBudgetEst: 'Over $12B (Internal IT & Supercomputing)',
        metrics: [
          { metric: 'Azure Cloud Revenue', value: '$85.4B', trend: 'Up' },
          { metric: 'Operating Margin', value: '44.6%', trend: 'Up' },
          { metric: 'R&D to Revenue', value: '12.0%', trend: 'Flat' }
        ]
      },
      strategic: [
        {
          priority: 'Industry Cloud Integration',
          timeline: '12-18 Months',
          impactLevel: 'High',
          details: 'Roll out tailored templates in Healthcare (Epic Systems integration) and Retail to drive high-margin licensing.',
          evidence: [{ source: 'Q3 Investor Transcript', credibility: 'High' }]
        },
        {
          priority: 'Sovereign Cloud Hegemony',
          timeline: '6-12 Months',
          impactLevel: 'High',
          details: 'Build insulated, hyper-secure datacenters within Germany, France, and Singapore to win government contracts.',
          evidence: [{ source: 'Press briefing by Head of Azure Global', credibility: 'High' }]
        }
      ],
      signals: [
        {
          signal: 'Spike in enterprise feedback complaining about standard Copilot ROI measurements.',
          urgency: 'Immediate',
          confidence: 94,
          businessImpact: 'Opens immediate consulting opportunities to co-design value proof dashboards.',
          evidence: [{ source: 'Gartner Enterprise Tech Buyer Sentiment Survey', credibility: 'Medium' }]
        },
        {
          signal: 'Heavy partner-incentive campaigns for Azure Fabric migration.',
          urgency: 'High',
          confidence: 89,
          businessImpact: 'Enables Indus Health Plus to bundle data cleansing and pipeline setups alongside Azure sales.',
          evidence: [{ source: 'Microsoft Partner Network Bulletin', credibility: 'High' }]
        }
      ],
      maturity: {
        scores: { cloud: 98, ai: 96, dataPlatform: 94, security: 92, devops: 95 },
        overall: 95,
        assessment: 'Elite Digital Pioneer. Virtually all infrastructures reside in cloud models, leveraging continuous CI/CD pipelines and cutting-edge machine learning optimization workflows.',
      },
      opportunities: [
        {
          opportunity: 'Cross-Industry GenAI Advisory Program',
          confidence: 92,
          priority: 'High',
          recommendedOffering: 'Enterprise Strategy Consulting',
          estimatedBusinessValue: '$450,000',
          suggestedWorkshop: '2-Day Executive AI Alignment Workshop',
          suggestedAccelerator: 'Copilot Value Tracker Framework',
          suggestedDiscoveryQuestions: [
            'How are your strategic enterprise accounts measuring productivity gains from Copilot subscriptions?',
            'What regulatory hurdles are your field teams facing when pitching Azure OpenAI to sovereign entities?'
          ]
        },
        {
          opportunity: 'Power Platform Customized Extensibility Plugins',
          confidence: 85,
          priority: 'Medium',
          recommendedOffering: 'Advanced Solutions Development',
          estimatedBusinessValue: '$280,000',
          suggestedWorkshop: '1-Day PowerAutomate Sandbox Build',
          suggestedAccelerator: 'Indus Health Plus Flow Connectors',
          suggestedDiscoveryQuestions: [
            'Which manual workflows in customer billing are currently decoupled from Dynamics 365 ERP?',
            'How are departmental analysts resolving multi-source data mapping without crashing Fabric pipelines?'
          ]
        }
      ],
      executive: {
        businessSummary: 'Microsoft is executing on an elite strategic roadmap focusing heavily on Azure consumption, sovereign cloud security, and cross-suite Copilot integration. They are navigating compute costs while seeking ecosystems partners to drive concrete ROI stories for their subscribers.',
        technologySummary: 'Runs a robust, world-class hyper-scale Azure model coupled with proprietary LLM endpoints. Expanding native security compliance protocols and bespoke custom processor silicon.',
        currentInitiatives: ['Scaling Azure OpenAI vertical integrations', 'Broadening sovereign public-sector boundaries in EU', 'Building custom silicone processing units'],
        keyRisks: ['Spiraling AI datacenter CAPEX scaling faster than near-term licensing revenue', 'GPU cluster power and supply chain bottlenecks', 'Consumer anxiety over IP privacy borders'],
        keyOpportunities: ['Strategic consulting to help Microsoft buyers demonstrate AI ROI', 'Co-building specific connectors for PowerAutomate', 'Expanding sovereign datacenter secure pipelines'],
        recommendedStrategy: 'Position Indus Health Plus as a High-Leverage Solutions Partner. Rather than trying to sell general software, lead with a specialized consultancy focused on proving Copilot and Azure OpenAI ROI to enterprise accounts, co-designing custom value trackers.',
        recommendedIntellifyServices: ['Enterprise Strategy Consulting', 'Advanced Solutions Development', 'Rapid Prototyping'],
        overallConfidence: 94,
      }
    }
  },
  acc_nike: {
    accountId: 'acc_nike',
    pipeline: getCompletedPipeline('2026-06-28T09:15:00Z'),
    scoring: {
      overallScore: 84,
      factors: {
        technologyFit: 85,
        businessTransformation: 88,
        cloudAdoption: 90,
        aiInvestments: 82,
        hiringTrends: 86,
        dataModernization: 89,
        buyingSignals: 80,
        recentNews: 75,
        financialGrowth: 80,
        leadershipDirection: 85,
      }
    },
    coverage: {
      website: 100,
      leadership: 100,
      products: 80,
      technology: 75,
      hiring: 100,
      annualReport: 100,
      quarterlyReport: 80,
      investorPresentation: 70,
      uploadedDocuments: 100,
      manualNotes: 40,
      news: 100,
      overallScore: 85,
    },
    researchQuality: 'A',
    data: {
      company: {
        legalName: 'Nike, Inc.',
        founded: '1964',
        employees: '83,000+',
        headquarters: 'Beaverton, Oregon, US',
        description: 'A global sportswear giant renowned for athletic footwear, apparel, and active accessories. Transitioning its digital profile to focus on demand forecasting and hyper-personalized retail customer mapping.',
        sectors: ['Consumer Goods', 'Apparel & Fashion', 'Retail', 'E-commerce'],
        competitors: ['Adidas', 'Puma', 'Under Armour', 'On Running', 'Hoka'],
      },
      business: {
        marketPosition: 'World Leader in Sports Footwear and Apparel. Rebalancing wholesale distribution channels after a hyper-focus on direct-to-consumer (D2C) generated logistics challenges and excess stock.',
        swot: {
          strengths: ['Unrivaled brand loyalty and athlete endorsements', 'Deep consumer data reservoir from Nike Run Club / membership', 'Consistent innovation pipeline in performance cushioning'],
          weaknesses: ['Previous wholesale partner friction due to D2C focus', 'Inventory backlog forcing promotional discount write-downs', 'Long supply chain lead times from Asian manufacturing hubs'],
          opportunities: ['Localized, automated predictive inventory allocation', 'Generative customized product designs via Nike By You', 'Bridging digital and physical stores via modern RDX services'],
          threats: ['Fast-growing agile niche brands (On, Hoka) taking running market share', 'Evolving global labor compliance auditing standards', 'Currency fluctuations impacting multi-national retail margins']
        },
        keyOfferings: ['Nike App Ecosystem', 'Nike Membership Loyalty Program', 'SNKRS Release Platform', 'Direct Retail Doors', 'Wholesale Distributions'],
      },
      technology: {
        summary: 'Nike operates a highly integrated cloud and consumer-facing application network, leveraging Salesforce, Adobe Experience, and Snowflake for real-time customer data aggregation and multi-channel marketing.',
        findings: [
          {
            technology: 'Salesforce Commerce & Service Cloud',
            category: 'CRM',
            confidence: 96,
            businessImpact: 'Manages consumer identity, order processing, and customer support channels across regions.',
            evidence: [{ source: 'Job listings for Senior Salesforce Solution Architects', credibility: 'High' }]
          },
          {
            technology: 'Snowflake Data Cloud',
            category: 'Data Platform',
            confidence: 91,
            businessImpact: 'Aggregates massive streams of purchase logs, app telemetry, and loyalty tracking.',
            evidence: [{ source: 'Tech blogs and Snowflake customer highlights', credibility: 'High' }]
          },
          {
            technology: 'AWS (Amazon Web Services)',
            category: 'Cloud',
            confidence: 94,
            businessImpact: 'Primary cloud host for consumer apps, APIs, and digital commerce backends.',
            evidence: [{ source: 'Engineering profiles and public developer records', credibility: 'High' }]
          }
        ]
      },
      news: [
        {
          id: 'news_nk_1',
          title: 'Nike Unveils Digital-First Retail Hub in Tokyo Featuring AI-Driven Fit and Styling',
          date: '2026-06-25',
          source: 'Nikkei Retail',
          sentiment: 'Positive',
          impact: 'Establishes a model for physical-digital retail convergence globally.',
        },
        {
          id: 'news_nk_2',
          title: 'Nike CFO Outlines Multi-Year Supply Chain Efficiency Initiative to Save $2B',
          date: '2026-06-18',
          source: 'Bloomberg Technology',
          sentiment: 'Neutral',
          impact: 'Signals major cost controls and potential restructuring of legacy IT vendor agreements.',
        }
      ],
      hiring: {
        openRoleCount: 380,
        focusAreas: ['Supply Chain Data Science', 'Retail Digital Experience Architecture', 'Generative Creative Design'],
        skillsInDemand: ['Python', 'SQL', 'Snowflake', 'Predictive Analytics', 'SaaS integrations'],
        trends: [
          'Increasing job postings for physical-store digital integration technology specialists.',
          'Recruiting predictive modelers to anticipate retail demand trends.',
        ],
        evidence: [{ source: 'Nike Careers and Linkedin Talent Insights', credibility: 'High' }]
      },
      financial: {
        fiscalYear: 'FY2026 TTM',
        revenue: '$51.2B',
        netIncome: '$5.4B',
        growthRate: '+1% YoY',
        rdSpend: '$1.8B',
        digitalBudgetEst: '$450M (Consolidated digital transformation)',
        metrics: [
          { metric: 'Digital Channel Share', value: '26.0%', trend: 'Flat' },
          { metric: 'Gross Margin', value: '44.3%', trend: 'Up' },
          { metric: 'Inventory Valuation', value: '$7.8B', trend: 'Down' }
        ]
      },
      strategic: [
        {
          priority: 'Rebuilding Wholesale Balance',
          timeline: '12 Months',
          impactLevel: 'High',
          details: 'Restore relationships with Foot Locker, JD Sports, and key regional doors to clear inventory efficiently.',
          evidence: [{ source: 'CEO briefing to Wall Street analysts', credibility: 'High' }]
        },
        {
          priority: 'Supply Chain Compression',
          timeline: '12-24 Months',
          impactLevel: 'High',
          details: 'Utilize predictive machine learning to shorten design-to-shelf cycles from 18 months to 6 months for trend apparel.',
          evidence: [{ source: 'Nike Operations Director public webinar', credibility: 'Medium' }]
        }
      ],
      signals: [
        {
          signal: 'Active RFP searching for third-party consumer sentiment intelligence software.',
          urgency: 'High',
          confidence: 85,
          businessImpact: 'Unlocks a high-probability consulting and advanced solutions pipeline for custom data mapping.',
          evidence: [{ source: 'Tech bidding registers and vendor bulletins', credibility: 'Medium' }]
        },
        {
          signal: 'Leadership public announcements prioritizing a $2B supply chain reduction program.',
          urgency: 'Immediate',
          confidence: 90,
          businessImpact: 'High alignment with Indus Health Plus\'s custom routing and predicting accelerators.',
          evidence: [{ source: 'Q4 Earnings Call Transcript', credibility: 'High' }]
        }
      ],
      maturity: {
        scores: { cloud: 90, ai: 78, dataPlatform: 89, security: 85, devops: 82 },
        overall: 84,
        assessment: 'Digital Practitioner. Strong cloud adoption and unified data warehouse pipelines, but AI remains clustered in siloed pilot stages rather than automated enterprise workflows.',
      },
      opportunities: [
        {
          opportunity: 'D2C Hyper-Personalization Engine',
          confidence: 88,
          priority: 'High',
          recommendedOffering: 'Advanced Analytics & AI Development',
          estimatedBusinessValue: '$650,000',
          suggestedWorkshop: 'Nike Membership Intent Mapping Workshop',
          suggestedAccelerator: 'Indus Health Plus Hyper-Personalization Module',
          suggestedDiscoveryQuestions: [
            'How are your current retail apps converting in-store beacon pings to digital loyalty interactions?',
            'What latency barriers exist when combining Snowflake customer metrics with Salesforce marketing streams?'
          ]
        },
        {
          opportunity: 'Supply Chain Predictive Demand Pilot',
          confidence: 82,
          priority: 'High',
          recommendedOffering: 'Custom Supply Chain Solutions',
          estimatedBusinessValue: '$520,000',
          suggestedWorkshop: '1-Day Logistics Modeling Sandbox',
          suggestedAccelerator: 'Indus Health Plus Route & Demand Predictor',
          suggestedDiscoveryQuestions: [
            'Where is the greatest inventory friction occurring inside the regional shipping warehouses?',
            'How do you currently adjust production schedules at Asian facilities when regional trend signals spike?'
          ]
        }
      ],
      executive: {
        businessSummary: 'Nike is actively pivoting its strategic profile to reconnect with classic wholesale partners while driving down bloated inventories. They have launched a $2B efficiency mandate, seeking technologies to optimize demand prediction and hyper-personalize customer apps.',
        technologySummary: 'Solid architecture utilizing AWS, Salesforce, and Snowflake. Focus is moving to physical-digital store systems and automated supply logistics routing.',
        currentInitiatives: ['Re-engaging wholesale retailers', 'Implementing Tokyo physical-digital retail models', 'Re-architecting global logistics routing software'],
        keyRisks: ['Spike in nimbler competitors stealing running market share', 'Margin dilution due to ongoing promotional clearance cycles', 'Disconnected customer loyalty data across regional application silos'],
        keyOpportunities: ['Bespoke predictive demand engines to lower warehouse stock backlogs', 'D2C customer personalization consultancies', 'Co-innovation labs for Beaverton research alignment'],
        recommendedStrategy: 'Lead with the $2B Operations Savings Angle. Position Indus Health Plus\'s Custom Supply Chain Predictive engines as a direct lever to lower inventory backlogs and speed up design-to-shelf latency.',
        recommendedIntellifyServices: ['Advanced Analytics & AI Development', 'Custom Supply Chain Solutions'],
        overallConfidence: 86,
      }
    }
  },
  acc_pfizer: {
    accountId: 'acc_pfizer',
    pipeline: getInProgressPipeline(),
    scoring: {
      overallScore: 78,
      factors: {
        technologyFit: 80,
        businessTransformation: 82,
        cloudAdoption: 85,
        aiInvestments: 88,
        hiringTrends: 78,
        dataModernization: 84,
        buyingSignals: 70,
        recentNews: 72,
        financialGrowth: 65,
        leadershipDirection: 80,
      }
    },
    coverage: {
      website: 100,
      leadership: 100,
      products: 60,
      technology: 70,
      hiring: 90,
      annualReport: 80,
      quarterlyReport: 50,
      investorPresentation: 40,
      uploadedDocuments: 50,
      manualNotes: 20,
      news: 60,
      overallScore: 74,
    },
    researchQuality: 'B',
    data: {
      company: {
        legalName: 'Pfizer Inc.',
        founded: '1849',
        employees: '88,000+',
        headquarters: 'New York, NY, US',
        description: 'One of the world\'s premier biopharmaceutical companies, discovering, developing, and manufacturing medicines and vaccines. Aggressively shifting digital strategy to accelerate clinical trial recruitment and computational biology.',
        sectors: ['Pharmaceuticals', 'Biotech', 'Healthcare', 'Life Sciences'],
        competitors: ['Moderna', 'Merck', 'Eli Lilly', 'Johnson & Johnson', 'Roche'],
      },
      business: {
        marketPosition: 'Global Biopharma Leader. Navigating a post-pandemic revenue contraction by restructuring overhead and investing heavily in oncology (Seagen acquisition) and generative AI discovery pipelines.',
        swot: {
          strengths: ['World-class mRNA and vaccine manufacturing infrastructure', 'Deep R&D pipeline with multiple phase-3 trial assets', 'Strong brand credit with global health regulators'],
          weaknesses: ['Severe post-COVID product sales drop impacting operating cash', 'Expirations of key patents on high-margin cardiovascular medicines', 'Massive data integration hurdles across global clinical labs'],
          opportunities: ['Utilizing generative AI to parse oncology datasets and expedite discovery', 'Leveraging secure, HIPAA-compliant LLMs to automate trial matching', 'Streamlining global regulatory documentation filings via automation'],
          threats: ['Intense competitive progress in weight-loss treatments (GLP-1s) by rivals', 'Evolving price controls and drug negotiating legislation in the US', 'Geopolitical risks affecting active chemical ingredient shipments']
        },
        keyOfferings: ['Vaccines', 'Oncology Therapeutics', 'Cardiology Medicines', 'Global Clinical Trial Operations', 'Biomedical R&D Labs'],
      },
      technology: {
        summary: 'Pfizer utilizes high-performance cloud computing and secure hybrid databases, heavily relying on HIPAA-compliant AWS architectures and clinical analytics frameworks.',
        findings: [
          {
            technology: 'AWS HealthLake & Safe Sandboxes',
            category: 'Cloud',
            confidence: 94,
            businessImpact: 'Houses patient-consented health data with strict audit logging and encryption.',
            evidence: [{ source: 'AWS Life Sciences Summit Keynote', credibility: 'High' }]
          },
          {
            technology: 'Veeva Systems',
            category: 'CRM',
            confidence: 98,
            businessImpact: 'Manages sales alignment, healthcare provider (HCP) contacts, and compliance tracks.',
            evidence: [{ source: 'HCP engagement profiles and job boards', credibility: 'High' }]
          }
        ]
      },
      news: [
        {
          id: 'news_pf_1',
          title: 'Pfizer Closes $43B Acquisition of Seagen to Establish Dominance in Oncology Care',
          date: '2026-05-10',
          source: 'BioPharma Dive',
          sentiment: 'Positive',
          impact: 'Adds four approved cancer treatments and a massive oncology dataset ready for AI ingestion.',
        }
      ],
      hiring: {
        openRoleCount: 520,
        focusAreas: ['Computational Oncology Modeling', 'HIPAA-Compliant Systems Engineering', 'Trial Operations Managers'],
        skillsInDemand: ['Python', 'R', 'Bioinformatics', 'AWS IAM Security', 'Biostatistics'],
        trends: [
          'High density of positions seeking machine learning developers to sit directly with biological researchers.',
          'Recruiting for regional clinical trial coordinators across Europe.',
        ],
        evidence: [{ source: 'Pfizer Careers Board', credibility: 'High' }]
      },
      financial: {
        fiscalYear: 'FY2026 TTM',
        revenue: '$58.5B',
        netIncome: '$3.2B',
        growthRate: '-14% YoY (COVID drop stabilization)',
        rdSpend: '$10.8B',
        digitalBudgetEst: '$550M (Clinical trial systems & computing)',
        metrics: [
          { metric: 'Oncology Segment Sales', value: '$14.2B', trend: 'Up' },
          { metric: 'R&D Investment Rate', value: '18.4%', trend: 'Up' },
          { metric: 'Operating Efficiency Savings', value: '$4.0B', trend: 'Up' }
        ]
      },
      strategic: [
        {
          priority: 'Accelerating Oncology Pipelines',
          timeline: '12-24 Months',
          impactLevel: 'High',
          details: 'Leverage the Seagen acquisition to roll out 8 new clinical trial stages for targeted antibody-drug conjugates (ADCs).',
          evidence: [{ source: 'Pfizer Investor Day presentation', credibility: 'High' }]
        },
        {
          priority: 'Securing HIPAA Enterprise LLM Pipelines',
          timeline: '6-12 Months',
          impactLevel: 'High',
          details: 'Deploy custom insulated chat engines to let researchers securely query internal discovery manuals without data leaks.',
          evidence: [{ source: 'CIO public interview on digital health trends', credibility: 'Medium' }]
        }
      ],
      signals: [
        {
          signal: 'Public statements by Chief Digital Officer prioritizing the deployment of LLMs in clinical report editing.',
          urgency: 'Immediate',
          confidence: 91,
          businessImpact: 'Direct opportunity for Indus Health Plus\'s custom document indexing and parsing sandboxes.',
          evidence: [{ source: 'HealthTech Executive Roundtable Webinar', credibility: 'High' }]
        },
        {
          signal: 'Significant hiring spikes for custom bio-informaticians in San Diego R&D center.',
          urgency: 'High',
          confidence: 84,
          businessImpact: 'Signals a demand for high-performance computing pipelines and raw machine learning consultations.',
          evidence: [{ source: 'Indeed & LinkedIn recruitment activity', credibility: 'High' }]
        }
      ],
      maturity: {
        scores: { cloud: 88, ai: 82, dataPlatform: 84, security: 95, devops: 80 },
        overall: 85,
        assessment: 'Advanced Secure Practitioner. Exceptional compliance, data privacy, and auditing layers. Cloud adoption is advanced, but strict regulatory parameters slow down rapid DevOps deployments.',
      },
      opportunities: [
        {
          opportunity: 'Clinical Trial Subject Matching Pipeline',
          confidence: 84,
          priority: 'High',
          recommendedOffering: 'Life Sciences Regulatory AI Integration',
          estimatedBusinessValue: '$1,200,000',
          suggestedWorkshop: 'HIPAA-Compliant EHR Parsing Audit',
          suggestedAccelerator: 'Indus Health Plus Clinical Trial Indexer',
          suggestedDiscoveryQuestions: [
            'What is the average latency when your researchers screen candidate lists against trial criteria?',
            'How is the security team currently auditing third-party LLM APIs used for document draft processing?'
          ]
        },
        {
          opportunity: 'Secure R&D Document Ingestion Portal',
          confidence: 79,
          priority: 'Medium',
          recommendedOffering: 'Advanced Solutions Development',
          estimatedBusinessValue: '$480,000',
          suggestedWorkshop: '1-Day Secure LLM Sandbox Build',
          suggestedAccelerator: 'Indus Health Plus Document Indexer API',
          suggestedDiscoveryQuestions: [
            'How are disconnected global research labs sharing pre-clinical oncology observations?',
            'What compliance bottlenecks are delaying the ingestion of external Seagen databases?'
          ]
        }
      ],
      executive: {
        businessSummary: 'Pfizer is actively stabilizing its revenue base through a multi-billion dollar cost-containment program while prioritizing cancer therapies. Their digital technology teams are seeking high-leverage integrations to shorten clinical trial times and securely synthesize research data.',
        technologySummary: 'Runs a highly audited AWS HealthLake architecture with Veeva CRM. Principal need is secure, HIPAA-compliant LLM deployment for operational workflows.',
        currentInitiatives: ['Integrating Seagen oncology databases', 'Deploying insulated research chat environments', 'Automating regulatory filing documents'],
        keyRisks: ['Slowing operational cash flow due to patent expirations', 'Severe regulatory penalties if patient data leaks', 'Strong market competitors dominating the obesity therapeutics sector'],
        keyOpportunities: ['Bespoke patient trial matching engines', 'Secure pre-clinical document parsing portals', 'Co-innovating compliance workflows'],
        recommendedStrategy: 'Lead with Regulatory and HIPAA-Compliance Assurance. When pitching Indus Health Plus solutions, highlight our secure, isolated LLM indexing templates, demonstrating that patient data never exits the Pfizer-owned AWS VPC sandbox.',
        recommendedIntellifyServices: ['Life Sciences Regulatory AI Integration', 'Advanced Solutions Development'],
        overallConfidence: 82,
      }
    }
  },
  acc_target: {
    accountId: 'acc_target',
    pipeline: getNotStartedPipeline(),
    scoring: {
      overallScore: 65,
      factors: {
        technologyFit: 60,
        businessTransformation: 70,
        cloudAdoption: 68,
        aiInvestments: 55,
        hiringTrends: 72,
        dataModernization: 64,
        buyingSignals: 60,
        recentNews: 65,
        financialGrowth: 68,
        leadershipDirection: 68,
      }
    },
    coverage: {
      website: 100,
      leadership: 40,
      products: 50,
      technology: 40,
      hiring: 50,
      annualReport: 60,
      quarterlyReport: 40,
      investorPresentation: 30,
      uploadedDocuments: 20,
      manualNotes: 0,
      news: 40,
      overallScore: 62,
    },
    researchQuality: 'C',
    data: {}
  },
  acc_intel: {
    accountId: 'acc_intel',
    pipeline: getInProgressPipeline(),
    scoring: {
      overallScore: 72,
      factors: {
        technologyFit: 78,
        businessTransformation: 75,
        cloudAdoption: 80,
        aiInvestments: 85,
        hiringTrends: 72,
        dataModernization: 74,
        buyingSignals: 65,
        recentNews: 60,
        financialGrowth: 55,
        leadershipDirection: 75,
      }
    },
    coverage: {
      website: 100,
      leadership: 100,
      products: 70,
      technology: 75,
      hiring: 100,
      annualReport: 90,
      quarterlyReport: 80,
      investorPresentation: 60,
      uploadedDocuments: 40,
      manualNotes: 10,
      news: 100,
      overallScore: 80,
    },
    researchQuality: 'B',
    data: {}
  },
  acc_tesla: {
    accountId: 'acc_tesla',
    pipeline: getCompletedPipeline('2026-06-27T16:05:00Z'),
    scoring: {
      overallScore: 89,
      factors: {
        technologyFit: 95,
        businessTransformation: 94,
        cloudAdoption: 85,
        aiInvestments: 98,
        hiringTrends: 90,
        dataModernization: 92,
        buyingSignals: 84,
        recentNews: 88,
        financialGrowth: 80,
        leadershipDirection: 92,
      }
    },
    coverage: {
      website: 100,
      leadership: 100,
      products: 100,
      technology: 100,
      hiring: 100,
      annualReport: 100,
      quarterlyReport: 80,
      investorPresentation: 80,
      uploadedDocuments: 80,
      manualNotes: 30,
      news: 100,
      overallScore: 92,
    },
    researchQuality: 'A',
    data: {
      company: {
        legalName: 'Tesla, Inc.',
        founded: '2003',
        employees: '140,000+',
        headquarters: 'Austin, Texas, US',
        description: 'A global pioneer in electric vehicles, automotive energy systems, battery storage, and artificial intelligence robotics. Operates Dojo, its custom supercomputing platform designed to train FSD neural networks.',
        sectors: ['Automotive', 'Renewable Energy', 'AI & Robotics', 'Hardware Infrastructure'],
        competitors: ['BYD', 'Rivian', 'Lucid', 'CATL', 'Nvidia', 'Boston Dynamics'],
      },
      business: {
        marketPosition: 'Global EV Leader. Pivotally shifting its structural focus to robotaxis, unsupervised Full Self-Driving (FSD) software licensing, Megapack energy networks, and Optimus humanoid assembly lines.',
        swot: {
          strengths: ['Unparalleled expertise in automotive AI software training and edge compilation', 'Soaring growth in utility-scale Megapack energy storage', 'Deep cash reserves for capital-intensive cluster expansions'],
          weaknesses: ['Vulnerability to global battery mineral commodity prices', 'Price compression in consumer EV segment reducing overall margins', 'Sprawling factory logistics across three continents causing transport friction'],
          opportunities: ['Licensing unsupervised Level 4 FSD software to legacy automakers', 'Deploying Optimus humanoid robots into factory materials handling', 'Establishing decentralized virtual power plant networks via customer batteries'],
          threats: ['Fast regulatory setbacks delaying commercial robotaxi launches', 'Geopolitical mining tariffs on raw cobalt, nickel, and lithium', 'Aggressive pricing competition from subsidized Chinese EV makers']
        },
        keyOfferings: ['Model 3/Y/S/X and Cybertruck', 'Full Self-Driving (FSD) Subscriptions', 'Megapack & Powerwall Energy Storage', 'Dojo Supercomputing Platform', 'Optimus Humanoid Robotics'],
      },
      technology: {
        summary: 'Tesla functions like a software and microchip laboratory, running custom real-time Linux operating systems, Docker/Kubernetes clusters for telemetry logs, and proprietary silicon accelerators.',
        findings: [
          {
            technology: 'Dojo Supercomputing Cluster',
            category: 'AI',
            confidence: 98,
            businessImpact: 'Hosts proprietary neural networks, handling millions of video logs daily.',
            evidence: [{ source: 'AI Day presentations and developer blogs', credibility: 'High' }]
          },
          {
            technology: 'Telemetry Ingestion Grid',
            category: 'Data Platform',
            confidence: 95,
            businessImpact: 'Ingests, catalogs, and indexes terabytes of real-time vehicle sensor feeds via Kafka/Kubernetes pipelines.',
            evidence: [{ source: 'Tesla Platform Engineering conference speeches', credibility: 'High' }]
          },
          {
            technology: 'Tesla custom Linux kernel',
            category: 'Cloud',
            confidence: 99,
            businessImpact: 'Bespoke, bare-metal vehicle firmware ensuring low-latency operations.',
            evidence: [{ source: 'Open source kernel releases & firmware analyses', credibility: 'High' }]
          }
        ]
      },
      news: [
        {
          id: 'news_ts_1',
          title: 'Tesla Delivers First Fleet of 100 Megapacks to Southern California Edison Storage Substation',
          date: '2026-06-26',
          source: 'CleanTechnica',
          sentiment: 'Positive',
          impact: 'Validates commercial grid-balancing energy capabilities and establishes massive utility backlog.',
        },
        {
          id: 'news_ts_2',
          title: 'Optimus Robot Completes 100-Hour Autonomous Logistics Run at Texas Gigafactory',
          date: '2026-06-14',
          source: 'Automotive News',
          sentiment: 'Positive',
          impact: 'Highlights rapid progress toward commercial humanoid materials labor.',
        }
      ],
      hiring: {
        openRoleCount: 840,
        focusAreas: ['Computer Vision latency modeling', 'ASIC hardware physical designs', 'Edge-fleet API routing'],
        skillsInDemand: ['C++', 'Rust', 'CUDA', 'Python', 'Real-time OS scheduling'],
        trends: [
          'Aggressive recruitment for Edge-Computing security architects to seal fleet communication channels.',
          'Postings seeking materials negotiators to consolidate chemical mining sources.',
        ],
        evidence: [{ source: 'Tesla Careers', credibility: 'High' }]
      },
      financial: {
        fiscalYear: 'FY2026 TTM',
        revenue: '$98.4B',
        netIncome: '$11.2B',
        growthRate: '+8% YoY',
        rdSpend: '$4.2B',
        digitalBudgetEst: '$1.5B (AI Cluster & Dojo expansion)',
        metrics: [
          { metric: 'Megapack Business Share', value: '$6.4B (+88% YoY)', trend: 'Up' },
          { metric: 'R&D CAPEX Rate', value: '11.5%', trend: 'Up' },
          { metric: 'On-Board Software Revenue', value: '$2.1B', trend: 'Up' }
        ]
      },
      strategic: [
        {
          priority: 'FSD Level-4 Clearance',
          timeline: '12 Months',
          impactLevel: 'High',
          details: 'Secure regulatory approval across California, Texas, and Nevada to operate early-stage commercial robotaxi loops.',
          evidence: [{ source: 'Econ-Briefing transcript with CEO', credibility: 'High' }]
        },
        {
          priority: 'Optimus Integration',
          timeline: '12-24 Months',
          impactLevel: 'Medium',
          details: 'Incorporate 1,000 early-stage Optimus robots into internal materials logistics to prove factory efficiency gains.',
          evidence: [{ source: 'Tesla shareholder meeting slides', credibility: 'High' }]
        }
      ],
      signals: [
        {
          signal: 'Strategic investment in companies specialized in managing decentralized battery micro-grids.',
          urgency: 'High',
          confidence: 89,
          businessImpact: 'Opens partnerships to co-design grid predicting dashboards with Indus Health Plus.',
          evidence: [{ source: 'Venture capital filings and energy registry logs', credibility: 'Medium' }]
        },
        {
          signal: 'Recruitment campaigns for edge security engineers to protect vehicle-to-everything (V2X) links.',
          urgency: 'Immediate',
          confidence: 92,
          businessImpact: 'High alignment with Indus Health Plus\'s advanced telemetry encryption models.',
          evidence: [{ source: 'Tesla Careers & engineering profiles', credibility: 'High' }]
        }
      ],
      maturity: {
        scores: { cloud: 85, ai: 98, dataPlatform: 92, security: 90, devops: 95 },
        overall: 92,
        assessment: 'Elite Computing Innovator. Unmatched AI training, compilation, and edge execution capabilities. Cloud operations are robust but intentionally highly customized around bare-metal and proprietary topologies.',
      },
      opportunities: [
        {
          opportunity: 'Gigafactory Supply Chain Risk Modeling Hub',
          confidence: 90,
          priority: 'High',
          recommendedOffering: 'Custom Supply Chain Solutions',
          estimatedBusinessValue: '$820,000',
          suggestedWorkshop: 'Supply Chain Analytics Co-Innovation Forum',
          suggestedAccelerator: 'Indus Health Plus Commodity Risk Predictor',
          suggestedDiscoveryQuestions: [
            'What is the current cycle lag when your logistics planners anticipate minerals constraints at Asian ports?',
            'How is Dojo telemetry mapped into your active factory assembly scheduling?'
          ]
        },
        {
          opportunity: 'V2X Edge Security Sandbox Pilot',
          confidence: 84,
          priority: 'Medium',
          recommendedOffering: 'Advanced Solutions Development',
          estimatedBusinessValue: '$450,000',
          suggestedWorkshop: 'Edge Telemetry Decryption Workshop',
          suggestedAccelerator: 'Indus Health Plus Secure Enclave Connector',
          suggestedDiscoveryQuestions: [
            'What payload latency boundaries must be respected when applying encryption layers to edge telemetry?',
            'How does vehicle-to-grid grid balancing software audit third-party micro-provider logs?'
          ]
        }
      ],
      executive: {
        businessSummary: 'Tesla functions like a highly specialized computing and robotics lab, shifting its balance sheet toward autonomy and utility energy storage. They are looking for co-innovation partnerships to predicted supply bottlenecks and protect decentralized battery networks.',
        technologySummary: 'Runs Dojo supercomputers and edge-FSD neural architectures. High focus on secure, low-latency firmware operations.',
        currentInitiatives: ['Scaling Megapack production lines', 'Deploying Optimus humanoid robots in Gigafactories', 'Securing level 4 FSD approvals'],
        keyRisks: ['Evolving regulatory friction delaying robotaxi launches', 'EV pricing wars eroding margins', 'Sourcing chemical mining elements securely'],
        keyOpportunities: ['Custom mineral risk prediction software integrations', 'V2X secure cloud sandbox pilots', 'Grid load-balancing co-innovation'],
        recommendedStrategy: 'Position as a Specialized Engineering Partner. Avoid standard administrative solutions; focus exclusively on high-performance computational risk models or secure edge-device clusters.',
        recommendedIntellifyServices: ['Custom Supply Chain Solutions', 'Advanced Solutions Development'],
        overallConfidence: 90,
      }
    }
  }
};
