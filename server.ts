/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { connectMongo } from "./src/db/mongo.ts";
import {
  UserModel,
  AllowedUserModel,
  AccountModel,
  StakeholderModel,
  OpportunityModel,
  DocumentModel,
  TemplateModel,
  ActivityModel,
  SettingModel,
  NotificationModel,
  CustomResearchModel,
  OrchestratedResearchModel,
  EvidenceModel,
} from "./src/db/models.ts";
import {
  INITIAL_ACCOUNTS,
  INITIAL_STAKEHOLDERS,
  MOCK_OPPORTUNITIES,
  MOCK_DOCUMENTS,
  INITIAL_TEMPLATES,
  INITIAL_ACTIVITIES,
  MOCK_RESEARCH_TEMPLATES,
  INITIAL_EVIDENCE,
} from "./src/data.ts";
import { INITIAL_ORCHESTRATED_RESEARCH } from "./src/orchestratedData.ts";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { deriveOwnerEmail } from "./src/lib/signalsEngine.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to execute Gemini API calls with retries and robust fallback models
async function generateContentWithRetryAndFallback(
  ai: any,
  params: {
    model: string;
    contents: any;
    config?: any;
  },
  maxRetries = 3
): Promise<any> {
  const modelsToTry = [
    params.model,
    "gemini-3.1-flash-lite", // Extremely reliable, fast fallback model
    "gemini-3.5-flash",      // Flash fallback
  ];

  // Remove duplicates, keep order
  const uniqueModels = Array.from(new Set(modelsToTry.filter(Boolean)));

  let lastError: any = null;

  for (const currentModel of uniqueModels) {
    let delay = 1000; // Exponential backoff starts at 1 second
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini API] Attempt ${attempt}/${maxRetries} using model: ${currentModel}`);
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: params.contents,
          config: params.config,
        });
        console.log(`[Gemini API] Success using model: ${currentModel} on attempt ${attempt}`);
        return response;
      } catch (error: any) {
        lastError = error;
        const errorMessage = error?.message || String(error);
        const isUnavailable = errorMessage.includes("503") ||
          errorMessage.toLowerCase().includes("unavailable") ||
          errorMessage.toLowerCase().includes("high demand") ||
          errorMessage.toLowerCase().includes("rate limit") ||
          errorMessage.toLowerCase().includes("429");

        console.error(`[Gemini API Error] Model ${currentModel} attempt ${attempt} failed: ${errorMessage}`);

        if (isUnavailable && attempt < maxRetries) {
          console.log(`[Gemini API] Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // exponential backoff
        } else {
          // Break inner loop and try the next fallback model if it's not a temporary 503/429
          break;
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content after trying fallback models.");
}

// API: Research Orchestrator Endpoint
app.post("/api/research", requireAuth, async (req: AuthRequest, res) => {
  const { accountName, website, industry, apiKey, model } = req.body;

  // Centralized Gemini API key: identical and immutable for all existing and new users
  const activeKey = process.env.GEMINI_API_KEY || (apiKey && apiKey !== 'SERVER_MANAGED_KEY' ? apiKey : undefined);
  const activeModel = model || "gemini-3.5-flash";

  if (!activeKey) {
    return res.status(500).json({
      error: "Google Gemini API key is missing on the server. Please ensure GEMINI_API_KEY is configured in your project secrets.",
      isConfigError: true
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: activeKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const prompt = `Perform an enterprise-grade target company research sweep for sales intelligence and account-based marketing alignment.
Company Name: ${accountName}
Website/Domain: ${website || "Not provided"}
Primary Industry: ${industry || "Technology & Consulting"}

Your output must be structured, realistic, and contain detailed insights about their technology stack, business model, SWOT analysis, executive leadership team, hiring trends, financial standing, strategic initiatives, and direct buying signals. 
Include realistic source citations (like SEC Filings, Earnings Calls, Careers page, and Tech Index profiles) in your evidence lists to support your findings. Make sure descriptions are sophisticated, professional, and directly actionable.

CRITICAL RULE FOR DATA INTEGRITY: If you cannot find any verified, reliable public information, news, or related data about this specific company (e.g., if it is too small, a private regional business, or does not exist), do NOT hallucinate or invent mock corporate descriptions, SWOT analyses, or fake technology findings. Instead, populate the output fields with clear "No data found" or "No verified information found" indicators (e.g., set description to "No verified public data found for this company.", founded/employees/headquarters to "Unknown", and leave lists empty or mark findings and SWOT lists as "No data found") to ensure absolute data integrity.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        scoringFactors: {
          type: Type.OBJECT,
          properties: {
            technologyFit: { type: Type.INTEGER, description: "A score from 50 to 100 assessing how well their technology stack fits Indus Health Plus's services." },
            businessTransformation: { type: Type.INTEGER, description: "Score 50-100 indicating transformation opportunities." },
            cloudAdoption: { type: Type.INTEGER, description: "Score 50-100 of cloud progress." },
            aiInvestments: { type: Type.INTEGER, description: "Score 50-100 of AI interest/initiatives." },
            hiringTrends: { type: Type.INTEGER, description: "Score 50-100 of hiring health in tech areas." },
            dataModernization: { type: Type.INTEGER, description: "Score 50-100 of database modernization potential." },
            buyingSignals: { type: Type.INTEGER, description: "Score 50-100 of active buying signals." },
            recentNews: { type: Type.INTEGER, description: "Score 50-100 of positive news trigger events." },
            financialGrowth: { type: Type.INTEGER, description: "Score 50-100 of financial capacity." },
            leadershipDirection: { type: Type.INTEGER, description: "Score 50-100 of alignment with modern tech leadership." }
          },
          required: [
            "technologyFit", "businessTransformation", "cloudAdoption", "aiInvestments",
            "hiringTrends", "dataModernization", "buyingSignals", "recentNews",
            "financialGrowth", "leadershipDirection"
          ]
        },
        company: {
          type: Type.OBJECT,
          properties: {
            legalName: { type: Type.STRING },
            founded: { type: Type.STRING },
            employees: { type: Type.STRING },
            headquarters: { type: Type.STRING },
            description: { type: Type.STRING, description: "Detailed multi-sentence summary description of the firm." },
            sectors: { type: Type.ARRAY, items: { type: Type.STRING } },
            competitors: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["legalName", "founded", "employees", "headquarters", "description", "sectors", "competitors"]
        },
        business: {
          type: Type.OBJECT,
          properties: {
            marketPosition: { type: Type.STRING },
            swot: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["strengths", "weaknesses", "opportunities", "threats"]
            },
            keyOfferings: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["marketPosition", "swot", "keyOfferings"]
        },
        technology: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  technology: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Must be one of: Cloud, Data Platform, Analytics, AI, ERP, CRM, BI, Integration" },
                  confidence: { type: Type.INTEGER, description: "0 to 100 confidence level of this tech use." },
                  businessImpact: { type: Type.STRING, description: "Business implications for the enterprise." },
                  evidence: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        source: { type: Type.STRING },
                        credibility: { type: Type.STRING, description: "High, Medium, or Low" }
                      },
                      required: ["source", "credibility"]
                    }
                  }
                },
                required: ["technology", "category", "confidence", "businessImpact", "evidence"]
              }
            }
          },
          required: ["summary", "findings"]
        },
        news: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              date: { type: Type.STRING, description: "YYYY-MM-DD" },
              source: { type: Type.STRING },
              sentiment: { type: Type.STRING, description: "Positive, Neutral, or Negative" },
              impact: { type: Type.STRING }
            },
            required: ["title", "date", "source", "sentiment", "impact"]
          }
        },
        hiring: {
          type: Type.OBJECT,
          properties: {
            openRoleCount: { type: Type.INTEGER },
            focusAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillsInDemand: { type: Type.ARRAY, items: { type: Type.STRING } },
            trends: { type: Type.ARRAY, items: { type: Type.STRING } },
            evidence: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  credibility: { type: Type.STRING }
                },
                required: ["source", "credibility"]
              }
            }
          },
          required: ["openRoleCount", "focusAreas", "skillsInDemand", "trends", "evidence"]
        },
        financial: {
          type: Type.OBJECT,
          properties: {
            fiscalYear: { type: Type.STRING },
            revenue: { type: Type.STRING },
            netIncome: { type: Type.STRING },
            growthRate: { type: Type.STRING },
            rdSpend: { type: Type.STRING },
            digitalBudgetEst: { type: Type.STRING },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING },
                  value: { type: Type.STRING },
                  trend: { type: Type.STRING, description: "Up, Down, or Flat" }
                },
                required: ["metric", "value", "trend"]
              }
            }
          },
          required: ["fiscalYear", "revenue", "netIncome", "growthRate", "rdSpend", "digitalBudgetEst", "metrics"]
        },
        strategic: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              priority: { type: Type.STRING },
              timeline: { type: Type.STRING },
              impactLevel: { type: Type.STRING, description: "High, Medium, or Low" },
              details: { type: Type.STRING },
              evidence: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    credibility: { type: Type.STRING }
                  },
                  required: ["source", "credibility"]
                }
              }
            },
            required: ["priority", "timeline", "impactLevel", "details", "evidence"]
          }
        },
        signals: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              signal: { type: Type.STRING },
              urgency: { type: Type.STRING, description: "Immediate, High, Medium, or Low" },
              confidence: { type: Type.INTEGER },
              businessImpact: { type: Type.STRING },
              evidence: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    credibility: { type: Type.STRING }
                  },
                  required: ["source", "credibility"]
                }
              }
            },
            required: ["signal", "urgency", "confidence", "businessImpact", "evidence"]
          }
        },
        maturity: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              properties: {
                cloud: { type: Type.INTEGER },
                ai: { type: Type.INTEGER },
                dataPlatform: { type: Type.INTEGER },
                security: { type: Type.INTEGER },
                devops: { type: Type.INTEGER }
              },
              required: ["cloud", "ai", "dataPlatform", "security", "devops"]
            },
            overall: { type: Type.INTEGER },
            assessment: { type: Type.STRING }
          },
          required: ["scores", "overall", "assessment"]
        },
        opportunities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              opportunity: { type: Type.STRING },
              confidence: { type: Type.INTEGER },
              priority: { type: Type.STRING, description: "High, Medium, or Low" },
              recommendedOffering: { type: Type.STRING },
              estimatedBusinessValue: { type: Type.STRING },
              suggestedWorkshop: { type: Type.STRING },
              suggestedAccelerator: { type: Type.STRING },
              suggestedDiscoveryQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: [
              "opportunity", "confidence", "priority", "recommendedOffering",
              "estimatedBusinessValue", "suggestedWorkshop", "suggestedAccelerator",
              "suggestedDiscoveryQuestions"
            ]
          }
        },
        executive: {
          type: Type.OBJECT,
          properties: {
            businessSummary: { type: Type.STRING },
            technologySummary: { type: Type.STRING },
            currentInitiatives: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedStrategy: { type: Type.STRING },
            recommendedIndusServices: { type: Type.ARRAY, items: { type: Type.STRING } },
            overallConfidence: { type: Type.INTEGER }
          },
          required: [
            "businessSummary", "technologySummary", "currentInitiatives", "keyRisks",
            "keyOpportunities", "recommendedStrategy", "recommendedIndusServices", "overallConfidence"
          ]
        }
      },
      required: [
        "scoringFactors", "company", "business", "technology", "news", "hiring",
        "financial", "strategic", "signals", "maturity", "opportunities", "executive"
      ]
    };

    const response = await generateContentWithRetryAndFallback(ai, {
      model: activeModel,
      contents: prompt,
      config: {
        systemInstruction: "You are a professional, elite strategic sales engineer and Account Based Marketing analyst at Indus Health Plus. You write beautiful, accurate, and detailed enterprise account analyses. Never output markdown outside of the JSON schema, and ensure everything is deeply realistic and actionable.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response content generated from Gemini.");
    }

    const parsedData = JSON.parse(text.trim());
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini API server-side research error:", error);
    return res.status(500).json({
      error: error.message || "An unexpected error occurred during research synthesis.",
    });
  }
});

// API: Stakeholder Intelligence & ABM Analysis Endpoint
app.post("/api/stakeholder/research", requireAuth, async (req: AuthRequest, res) => {
  const { stakeholder, companyResearch, apiKey, model } = req.body;

  // Centralized Gemini API key: identical and immutable for all existing and new users
  const activeKey = process.env.GEMINI_API_KEY || (apiKey && apiKey !== 'SERVER_MANAGED_KEY' ? apiKey : undefined);
  const activeModel = model || "gemini-3.5-flash";

  if (!activeKey) {
    return res.status(500).json({
      error: "Google Gemini API key is missing on the server. Please ensure GEMINI_API_KEY is configured in your project secrets.",
      isConfigError: true
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: activeKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const prompt = `Perform an elite target stakeholder account-based marketing (ABM) intelligence profile generation.
    
STAKEHOLDER PROFILE METADATA:
- Name: ${stakeholder?.name || "Unknown"}
- Job Title: ${stakeholder?.title || "Unknown"}
- Department: ${stakeholder?.department || "Unknown"}
- LinkedIn Profile URL: ${stakeholder?.linkedIn || "Not provided"}
- Additional Notes: ${stakeholder?.notes || "Not provided"}

PARENT COMPANY INTELLIGENCE CONTEXT:
- Company Name: ${companyResearch?.companyName || "Unknown"}
- Company Description: ${companyResearch?.description || "Not provided"}
- Strategic Priorities: ${JSON.stringify(companyResearch?.strategicPriorities || [])}
- Technology Landscape: ${JSON.stringify(companyResearch?.techLandscape || [])}
- Challenges: ${JSON.stringify(companyResearch?.challenges || [])}
- Buying Signals: ${JSON.stringify(companyResearch?.buyingSignals || [])}

Analyze this stakeholder's likely role assessment, persona classification, KPIs, business challenges, technology interests, communication style, engagement strategy, solutions alignment, and write draft communications.

CRITICAL INSTRUCTION FOR ABSOLUTE ACCURACY (DO NOT INVENT FACTS):
If specific details (like location, email, or a technology) cannot be realistically determined, return "Unknown" or empty list as appropriate. Never hallucinate or fabricate facts that are not implied by their role or company profile. Keep confidence score realistic (e.g. low if very limited information).

Structure the output exactly according to the requested JSON format schema. Keep descriptions professional, sophisticated, and directly actionable.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        basicInformation: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            title: { type: Type.STRING },
            department: { type: Type.STRING },
            location: { type: Type.STRING }
          },
          required: ["name", "title", "department", "location"]
        },
        roleAssessment: {
          type: Type.OBJECT,
          properties: {
            persona: { type: Type.STRING, description: "Must be one of: Executive Sponsor, Economic Buyer, Technical Buyer, Champion, Influencer, Gatekeeper, Decision Maker, End User, Unknown" },
            decisionAuthority: { type: Type.STRING, description: "High, Medium, Low, or Unknown" },
            technicalInfluence: { type: Type.STRING, description: "High, Medium, Low, or Unknown" },
            businessInfluence: { type: Type.STRING, description: "High, Medium, Low, or Unknown" }
          },
          required: ["persona", "decisionAuthority", "technicalInfluence", "businessInfluence"]
        },
        likelyKPIs: { type: Type.ARRAY, items: { type: Type.STRING } },
        businessChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
        technologyFocus: { type: Type.ARRAY, items: { type: Type.STRING } },
        likelyPriorities: { type: Type.ARRAY, items: { type: Type.STRING } },
        communicationStyle: { type: Type.STRING, description: "Must be one of: Executive, Business Focused, Technical, ROI Driven, Innovation Driven, Risk Focused, Operational, Unknown" },
        recommendedApproach: { type: Type.STRING },
        recommendedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendedIndusSolutions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              solution: { type: Type.STRING, description: "Name of the Indus Health Plus solution (e.g. Executive Health Checkups, Health Risk Assessment, Onsite Health Camps, Corporate Wellness, etc.)" },
              whyRelevant: { type: Type.STRING, description: "Specific context-aware reason for the recommendation" }
            },
            required: ["solution", "whyRelevant"]
          }
        },
        confidence: { type: Type.INTEGER },
        evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
        influenceScore: { type: Type.INTEGER, description: "Calculated influence score from 0 to 100" },
        decisionPower: {
          type: Type.OBJECT,
          properties: {
            budgetAuthority: { type: Type.STRING, description: "Estimated budget authority: High, Medium, Low, or Unknown" },
            technicalAuthority: { type: Type.STRING, description: "Estimated technical authority: High, Medium, Low, or Unknown" },
            businessAuthority: { type: Type.STRING, description: "Estimated business authority: High, Medium, Low, or Unknown" },
            overallDecisionPower: { type: Type.STRING, description: "Estimated overall decision power: High, Medium, Low, or Unknown" }
          },
          required: ["budgetAuthority", "technicalAuthority", "businessAuthority", "overallDecisionPower"]
        },
        engagementStrategy: {
          type: Type.OBJECT,
          properties: {
            bestOpeningConversation: { type: Type.STRING },
            businessAngle: { type: Type.STRING },
            technologyAngle: { type: Type.STRING },
            recommendedWorkshop: { type: Type.STRING },
            relevantAccelerator: { type: Type.STRING },
            relevantCaseStudy: { type: Type.STRING },
            likelyObjections: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedNextMeeting: { type: Type.STRING }
          },
          required: [
            "bestOpeningConversation", "businessAngle", "technologyAngle", "recommendedWorkshop",
            "relevantAccelerator", "relevantCaseStudy", "likelyObjections", "suggestedNextMeeting"
          ]
        },
        discoveryQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Must contain exactly 10 personalized discovery questions based on role and goals" },
        communicationPreview: {
          type: Type.OBJECT,
          properties: {
            executiveEmail: { type: Type.STRING, description: "A beautifully drafted, context-rich personalized executive outbound email draft" },
            linkedInConnectionRequest: { type: Type.STRING, description: "Personalized connection request note (max 300 chars)" },
            linkedInFollowUp: { type: Type.STRING, description: "Personalized LinkedIn follow up message draft" },
            workshopInvitation: { type: Type.STRING, description: "Customizable invitation text for a strategic session/workshop" },
            meetingAgenda: { type: Type.STRING, description: "Detailed 30-minute agenda items for a formal discussion" },
            discoveryCallAgenda: { type: Type.STRING, description: "Custom-tailored discovery discussion structure" }
          },
          required: ["executiveEmail", "linkedInConnectionRequest", "linkedInFollowUp", "workshopInvitation", "meetingAgenda", "discoveryCallAgenda"]
        }
      },
      required: [
        "basicInformation", "roleAssessment", "likelyKPIs", "businessChallenges", "technologyFocus",
        "likelyPriorities", "communicationStyle", "recommendedApproach", "recommendedQuestions",
        "recommendedIndusSolutions", "confidence", "evidence", "influenceScore", "decisionPower",
        "engagementStrategy", "discoveryQuestions", "communicationPreview"
      ]
    };

    const response = await generateContentWithRetryAndFallback(ai, {
      model: activeModel,
      contents: prompt,
      config: {
        systemInstruction: "You are a professional, elite strategic sales engineer and Account Based Marketing analyst at Indus Health Plus. You write beautiful, accurate, and detailed enterprise stakeholder analyses. Never output markdown outside of the JSON schema, and ensure everything is deeply realistic and actionable.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response content generated from Gemini.");
    }

    const parsedData = JSON.parse(text.trim());
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini API server-side stakeholder research error:", error);
    return res.status(500).json({
      error: error.message || "An unexpected error occurred during stakeholder research synthesis.",
    });
  }
});

// Database Synchronization and CRUD Endpoints (Cloud SQL + Drizzle)

app.get("/api/sync", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.dbUser.id;
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const userRole = req.dbUser.role || 'member';

    // Single unified DB visibility rule:
    // All accounts are visible to Indus Health Plus leadership and platform administrators.
    const isGlobalViewer =
      userEmail === 'shailesh.thakare@indushealthplus.com' ||
      userEmail === 'shashaank.d@indushealthplus.com' ||
      userEmail === 'balaji.hadole@indushealthplus.com' ||
      userEmail === 'samarth.patki@indushealthplus.com' ||
      userEmail === 'ecomm.indus@gmail.com' ||
      userRole === 'admin';

    // 1. Fetch all collections in parallel from MongoDB
    const [
      allAccounts,
      allStakeholders,
      allOpportunities,
      allDocuments,
      allActivities,
      allEvidence,
      allCustomResearches,
      allOrchestratedResearches,
      allTemplates,
      allNotifications,
      allSettings,
    ] = await Promise.all([
      AccountModel.find().lean(),
      StakeholderModel.find().lean(),
      OpportunityModel.find().lean(),
      DocumentModel.find().lean(),
      ActivityModel.find().lean(),
      EvidenceModel.find().lean(),
      CustomResearchModel.find().lean(),
      OrchestratedResearchModel.find().lean(),
      TemplateModel.find().lean(),
      NotificationModel.find().lean(),
      SettingModel.find().lean(),
    ]);

    // Filter accounts visible to this user
    let visibleAccounts: any[];
    if (isGlobalViewer) {
      // Indus Health Plus Leadership and Admins see ALL accounts across the organization
      visibleAccounts = allAccounts;
    } else {
      // Standard members see:
      // a) Accounts created by them
      // b) Accounts where they are the owner
      // c) Accounts explicitly shared with their email
      visibleAccounts = allAccounts.filter((acc: any) => {
        if (acc.userId === userId) return true;
        if (acc.createdByEmail && acc.createdByEmail.toLowerCase() === userEmail) return true;
        if (acc.owner && acc.owner.toLowerCase().includes(userEmail)) return true;
        if (Array.isArray(acc.sharedWith)) {
          const sharedList = (acc.sharedWith as string[]).map(e => String(e).toLowerCase().trim());
          if (sharedList.includes(userEmail)) return true;
        }
        return false;
      });
    }

    const visibleAccountIds = new Set(visibleAccounts.map((a: any) => a.id));

    // 2. Stakeholders for visible accounts
    const stakeholdersData = allStakeholders.filter((s: any) => visibleAccountIds.has(s.accountId));

    // 3. Opportunities for visible accounts
    const opportunitiesData = allOpportunities.filter((o: any) => visibleAccountIds.has(o.accountId));

    // 4. Documents for visible accounts
    const documentsData = allDocuments.filter((d: any) => visibleAccountIds.has(d.accountId));

    // 5. Activities for visible accounts
    const activitiesData = allActivities.filter((a: any) => !a.accountId || visibleAccountIds.has(a.accountId));

    // 6. Evidence for visible accounts
    const evidenceData = allEvidence.filter((e: any) => !e.accountId || visibleAccountIds.has(e.accountId));

    // 7. Researches for visible accounts
    const customResearchesMap: Record<string, any> = {};
    for (const cr of allCustomResearches as any[]) {
      if (visibleAccountIds.has(cr.accountId)) {
        customResearchesMap[cr.accountId] = cr;
      }
    }

    const orchestratedResearchesMap: Record<string, any> = {};
    for (const or of allOrchestratedResearches as any[]) {
      if (visibleAccountIds.has(or.accountId)) {
        orchestratedResearchesMap[or.accountId] = or;
      }
    }

    // 8. Templates - shared platform templates
    const templatesData = allTemplates;

    // 9. Notifications - Strictly filtered: Market signals are informed to account owners and Indus Health Plus leadership
    const notificationsData = allNotifications.filter((n: any) => {
      // If it's a market signal notification
      if (n.type === 'signal' || (n.title && n.title.includes('Signals'))) {
        const isLeadership =
          userEmail === 'shailesh.thakare@indushealthplus.com' ||
          userEmail === 'shashaank.d@indushealthplus.com' ||
          userEmail === 'balaji.hadole@indushealthplus.com' ||
          userEmail === 'samarth.patki@indushealthplus.com' ||
          userEmail === 'ecomm.indus@gmail.com' ||
          userRole === 'admin';
        if (isLeadership) return true;

        // Check explicit recipients array if present
        if (Array.isArray(n.recipients)) {
          const recs = (n.recipients as string[]).map(r => String(r).toLowerCase().trim());
          if (recs.includes(userEmail)) return true;
        }

        // Check if user is the Indus Health Plus Account Owner for this account
        if (n.accountId) {
          const acc = (allAccounts as any[]).find(a => a.id === n.accountId);
          if (acc) {
            const ownerEmail = deriveOwnerEmail(acc.owner, acc.createdByEmail).toLowerCase().trim();
            if (ownerEmail === userEmail) return true;
            if (acc.createdByEmail && acc.createdByEmail.toLowerCase().trim() === userEmail) return true;
            if (acc.owner && acc.owner.toLowerCase().includes(userEmail.split('@')[0])) return true;
          }
        }

        // Not an authorized recipient for this market signal
        return false;
      }

      // Non-signal notifications (account creation, research completion, etc.)
      return !n.userId || n.userId === userId || isGlobalViewer;
    });

    // 10. Settings - Uniform platform settings shared across all existing and new users
    const userSettings = (allSettings as any[]).find(s => s.id === 'global') || allSettings[0] || {
      id: 'global',
      userId: userId,
      aiProvider: 'Gemini',
      geminiApiKey: 'SERVER_MANAGED_KEY',
      modelSelection: 'gemini-3.5-flash',
      defaultResearchDepth: 'Deep',
      theme: 'Light',
    };

    res.json({
      accounts: visibleAccounts,
      stakeholders: stakeholdersData,
      opportunities: opportunitiesData,
      documents: documentsData,
      templates: templatesData,
      activities: activitiesData,
      notifications: notificationsData,
      evidence: evidenceData,
      customResearches: customResearchesMap,
      orchestratedResearches: orchestratedResearchesMap,
      settings: userSettings
    });
  } catch (error: any) {
    console.error("Failed to sync database data:", error);
    res.status(500).json({ error: "Failed to load platform data from database." });
  }
});

app.post("/api/accounts", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    if (!data.createdByEmail) {
      data.createdByEmail = userEmail;
    }
    if (!data.sharedWith || !Array.isArray(data.sharedWith)) {
      data.sharedWith = [];
    }
    data.userId = req.dbUser.id;
    await AccountModel.findOneAndUpdate(
      { id: data.id },
      { $set: data },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error upserting account:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/accounts/:id/share", requireAuth, async (req: AuthRequest, res) => {
  try {
    const accountId = req.params.id;
    const { emails } = req.body;
    if (!Array.isArray(emails)) {
      return res.status(400).json({ error: "An array of emails is required for sharing." });
    }

    const currentAccount: any = await AccountModel.findOne({ id: accountId }).lean();
    if (!currentAccount) {
      return res.status(404).json({ error: "Account not found." });
    }

    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const userRole = req.dbUser.role || 'member';

    const isGlobalViewer =
      userEmail === 'shailesh.thakare@indushealthplus.com' ||
      userEmail === 'shashaank.d@indushealthplus.com' ||
      userEmail === 'balaji.hadole@indushealthplus.com' ||
      userEmail === 'samarth.patki@indushealthplus.com' ||
      userEmail === 'ecomm.indus@gmail.com' ||
      userRole === 'admin';

    const isCreator = currentAccount.userId === req.dbUser.id ||
      (currentAccount.createdByEmail && currentAccount.createdByEmail.toLowerCase() === userEmail);
    const isOwner = currentAccount.owner && currentAccount.owner.toLowerCase().includes(userEmail);

    if (!isGlobalViewer && !isCreator && !isOwner) {
      return res.status(403).json({ error: "You do not have permission to manage sharing for this account." });
    }

    const cleanEmails = Array.from(new Set(emails.map((e: string) => String(e).toLowerCase().trim()).filter(Boolean)));

    const updated = await AccountModel.findOneAndUpdate(
      { id: accountId },
      { $set: { sharedWith: cleanEmails } },
      { new: true, lean: true }
    );

    // Log in activities
    try {
      await ActivityModel.create({
        id: `act_${Date.now()}`,
        userId: req.dbUser.id,
        timestamp: new Date().toISOString(),
        type: 'Sharing Updated',
        description: `Account shared with ${cleanEmails.length} team members (${cleanEmails.join(', ') || 'Private'})`,
        accountId: accountId,
        accountName: currentAccount.name
      });
    } catch (actErr) {
      console.warn("Failed to log activity for share:", actErr);
    }

    res.json({ success: true, account: updated, sharedWith: cleanEmails });
  } catch (err: any) {
    console.error("Error sharing account:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/accounts/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const accountId = req.params.id;
    await Promise.all([
      AccountModel.deleteOne({ id: accountId }),
      StakeholderModel.deleteMany({ accountId }),
      OpportunityModel.deleteMany({ accountId }),
      DocumentModel.deleteMany({ accountId }),
      CustomResearchModel.deleteOne({ accountId }),
      OrchestratedResearchModel.deleteOne({ accountId }),
      EvidenceModel.deleteMany({ accountId }),
    ]);
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting account:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/stakeholders", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    data.userId = req.dbUser.id;
    await StakeholderModel.findOneAndUpdate({ id: data.id }, { $set: data }, { upsert: true });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error upserting stakeholder:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/stakeholders/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await StakeholderModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting stakeholder:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/opportunities", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    data.userId = req.dbUser.id;
    await OpportunityModel.findOneAndUpdate({ id: data.id }, { $set: data }, { upsert: true });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error upserting opportunity:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/opportunities/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await OpportunityModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting opportunity:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/documents", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    data.userId = req.dbUser.id;
    await DocumentModel.findOneAndUpdate({ id: data.id }, { $set: data }, { upsert: true });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error upserting document:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/documents/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await DocumentModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting document:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/templates", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    data.userId = req.dbUser.id;
    await TemplateModel.findOneAndUpdate({ id: data.id }, { $set: data }, { upsert: true });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error upserting template:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/templates/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await TemplateModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting template:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/activities", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    data.userId = req.dbUser.id;
    await ActivityModel.findOneAndUpdate({ id: data.id }, { $set: data }, { upsert: true });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error upserting activity:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/activities/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await ActivityModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting activity:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/settings", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    // Centralize platform settings: keep Gemini API key permanent and identical for all existing and new users
    data.geminiApiKey = 'SERVER_MANAGED_KEY';
    data.userId = req.dbUser.id;
    data.id = 'global';
    await SettingModel.findOneAndUpdate({ id: 'global' }, { $set: data }, { upsert: true });
    res.json({ success: true, settings: data });
  } catch (err: any) {
    console.error("Error upserting settings:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notifications", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    data.userId = req.dbUser.id;
    await NotificationModel.findOneAndUpdate({ id: data.id }, { $set: data }, { upsert: true });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error upserting notification:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/notifications/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await NotificationModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/custom-researches", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    data.userId = req.dbUser.id;
    await CustomResearchModel.findOneAndUpdate({ accountId: data.accountId }, { $set: data }, { upsert: true });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error upserting custom research:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orchestrated-researches", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    data.userId = req.dbUser.id;
    await OrchestratedResearchModel.findOneAndUpdate({ accountId: data.accountId }, { $set: data }, { upsert: true });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error upserting orchestrated research:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/evidence", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    data.userId = req.dbUser.id;
    await EvidenceModel.findOneAndUpdate({ id: data.id }, { $set: data }, { upsert: true });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error upserting evidence:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/evidence/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await EvidenceModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting evidence:", err);
    res.status(500).json({ error: err.message });
  }
});

// Access Control & Allowed Users Endpoints

app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const email = req.user?.email;
    const userRole = req.dbUser?.role || 'member';
    res.json({
      authenticated: true,
      user: req.dbUser,
      email,
      role: userRole
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/allowed-users", requireAuth, async (req: AuthRequest, res) => {
  try {
    const list = await AllowedUserModel.find().sort({ id: 1 }).lean();
    res.json(list);
  } catch (err: any) {
    console.error("Error fetching allowed users:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/allowed-users", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.dbUser?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied: Administrator privileges required to manage team members." });
    }

    const { email, name, role } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const currentUserEmail = req.user?.email || "admin";

    const existingUser = await AllowedUserModel.findOne({ email: normalizedEmail }).lean();
    let savedUser;

    if (existingUser) {
      savedUser = await AllowedUserModel.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: {
            name: name?.trim() || normalizedEmail.split("@")[0],
            role: role === "admin" ? "admin" : "member",
            status: "active",
          }
        },
        { new: true, lean: true }
      );
    } else {
      const maxUser: any = await AllowedUserModel.findOne().sort({ id: -1 }).lean();
      const nextId = maxUser && typeof maxUser.id === 'number' ? maxUser.id + 1 : 1;
      savedUser = await AllowedUserModel.create({
        id: nextId,
        email: normalizedEmail,
        name: name?.trim() || normalizedEmail.split("@")[0],
        role: role === "admin" ? "admin" : "member",
        status: "active",
        addedBy: currentUserEmail,
      });
    }

    res.json({ success: true, user: savedUser });
  } catch (err: any) {
    console.error("Error adding allowed user:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/allowed-users/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.dbUser?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied: Administrator privileges required to edit team members." });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const { name, email, role, status } = req.body;
    const targetUser: any = await AllowedUserModel.findOne({ id }).lean();
    if (!targetUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // Protect primary owner from being demoted or suspended or email changed
    if (targetUser.email.toLowerCase() === "samarth.patki@indushealthplus.com") {
      if (email && email.toLowerCase().trim() !== "samarth.patki@indushealthplus.com") {
        return res.status(403).json({ error: "The primary platform owner email address cannot be changed." });
      }
      if (role && role !== 'admin') {
        return res.status(403).json({ error: "The primary platform owner cannot be demoted from admin." });
      }
      if (status && status !== 'active') {
        return res.status(403).json({ error: "The primary platform owner cannot be suspended." });
      }
    }

    const updatePayload: Record<string, any> = {};
    if (name !== undefined) updatePayload.name = name.trim();

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      if (!normalizedEmail || !normalizedEmail.includes("@")) {
        return res.status(400).json({ error: "Please provide a valid email address." });
      }
      // Check if email has changed and conflicts with another user
      if (normalizedEmail !== targetUser.email.toLowerCase()) {
        const conflict = await AllowedUserModel.findOne({ email: normalizedEmail }).lean();
        if (conflict) {
          return res.status(409).json({ error: `A user with email ${normalizedEmail} is already registered.` });
        }
        updatePayload.email = normalizedEmail;
      }
    }

    if (role && ['admin', 'member'].includes(role)) {
      updatePayload.role = role;
      try {
        await UserModel.updateMany({ email: targetUser.email }, { $set: { role } });
      } catch (err) {
        console.warn("Could not sync role to users collection:", err);
      }
    }

    if (status && ['active', 'suspended'].includes(status)) {
      updatePayload.status = status;
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.json({ success: true, user: targetUser });
    }

    const updated = await AllowedUserModel.findOneAndUpdate(
      { id },
      { $set: updatePayload },
      { new: true, lean: true }
    );

    // If email changed, sync in users collection if matching record exists
    if (updatePayload.email && updatePayload.email !== targetUser.email) {
      try {
        await UserModel.updateMany(
          { email: targetUser.email },
          { $set: { email: updatePayload.email } }
        );
      } catch (err) {
        console.warn("Could not sync email to users collection:", err);
      }
    }

    res.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("Error updating allowed user:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/allowed-users/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.dbUser?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied: Administrator privileges required to remove team members." });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    // Protect primary admin from deletion
    const existing: any = await AllowedUserModel.findOne({ id }).lean();
    if (existing && existing.email === "samarth.patki@indushealthplus.com") {
      return res.status(403).json({ error: "The primary platform owner cannot be removed." });
    }

    await AllowedUserModel.deleteOne({ id });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting allowed user:", err);
    res.status(500).json({ error: err.message });
  }
});

async function seedDefaultAllowedUsers() {
  try {
    const count = await AllowedUserModel.countDocuments();
    if (count === 0) {
      console.log("[Access Control] Seeding initial authorized Indus Health Plus leadership team...");
      await AllowedUserModel.insertMany([
        { id: 1, email: 'shailesh.thakare@indushealthplus.com', name: 'Shailesh Thakare', role: 'admin', status: 'active', addedBy: 'system' },
        { id: 2, email: 'shashaank.d@indushealthplus.com', name: 'Shashaank D', role: 'admin', status: 'active', addedBy: 'system' },
        { id: 3, email: 'balaji.hadole@indushealthplus.com', name: 'Balaji Hadole', role: 'admin', status: 'active', addedBy: 'system' },
        { id: 4, email: 'samarth.patki@indushealthplus.com', name: 'Samarth Patki', role: 'admin', status: 'active', addedBy: 'system' },
        { id: 5, email: 'ecomm.indus@gmail.com', name: 'Indus Admin', role: 'admin', status: 'active', addedBy: 'system' }
      ]);
      console.log("[Access Control] Seeded initial authorized users successfully.");
    }
  } catch (err) {
    console.error("[Access Control] Error verifying allowed users:", err);
  }
}

async function seedInitialDatabaseData() {
  try {
    const tasks: Promise<any>[] = [];

    if ((await AccountModel.countDocuments()) === 0) {
      tasks.push(AccountModel.insertMany(INITIAL_ACCOUNTS.map(a => ({ ...a, sharedWith: a.sharedWith || [] })), { ordered: false }).catch(() => {}));
    }
    if ((await StakeholderModel.countDocuments()) === 0) {
      tasks.push(StakeholderModel.insertMany(INITIAL_STAKEHOLDERS, { ordered: false }).catch(() => {}));
    }
    if ((await OpportunityModel.countDocuments()) === 0) {
      tasks.push(OpportunityModel.insertMany(MOCK_OPPORTUNITIES, { ordered: false }).catch(() => {}));
    }
    if ((await DocumentModel.countDocuments()) === 0) {
      tasks.push(DocumentModel.insertMany(MOCK_DOCUMENTS, { ordered: false }).catch(() => {}));
    }
    if ((await TemplateModel.countDocuments()) === 0) {
      tasks.push(TemplateModel.insertMany(INITIAL_TEMPLATES, { ordered: false }).catch(() => {}));
    }
    if ((await ActivityModel.countDocuments()) === 0) {
      tasks.push(ActivityModel.insertMany(INITIAL_ACTIVITIES, { ordered: false }).catch(() => {}));
    }
    if ((await EvidenceModel.countDocuments()) === 0) {
      tasks.push(EvidenceModel.insertMany(INITIAL_EVIDENCE, { ordered: false }).catch(() => {}));
    }
    if ((await CustomResearchModel.countDocuments()) === 0) {
      tasks.push(CustomResearchModel.insertMany(Object.values(MOCK_RESEARCH_TEMPLATES), { ordered: false }).catch(() => {}));
    }
    if ((await OrchestratedResearchModel.countDocuments()) === 0) {
      tasks.push(OrchestratedResearchModel.insertMany(Object.values(INITIAL_ORCHESTRATED_RESEARCH), { ordered: false }).catch(() => {}));
    }
    if ((await SettingModel.countDocuments()) === 0) {
      tasks.push(
        SettingModel.findOneAndUpdate(
          { id: 'global' },
          {
            $setOnInsert: {
              id: 'global',
              aiProvider: 'Gemini',
              geminiApiKey: 'SERVER_MANAGED_KEY',
              modelSelection: 'gemini-3.5-flash',
              defaultResearchDepth: 'Deep',
              theme: 'Light',
            }
          },
          { upsert: true }
        )
      );
    }

    if (tasks.length > 0) {
      console.log(`[MongoDB Seed] Seeding ${tasks.length} empty collections...`);
      await Promise.all(tasks);
      console.log("[MongoDB Seed] Baseline data seeding completed.");
    }
  } catch (err) {
    console.error("[MongoDB Seed] Error seeding initial data:", err);
  }
}

async function startServer() {
  await connectMongo();
  await seedDefaultAllowedUsers();
  await seedInitialDatabaseData();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[IAIP Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
