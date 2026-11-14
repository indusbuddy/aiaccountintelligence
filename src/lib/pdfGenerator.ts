/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { Account, OrchestratedResearch, Stakeholder, StakeholderIntelligence } from '../types';

/**
 * Generates and downloads a beautifully styled PDF report of the Company Research pipelines.
 */
export const exportCompanyResearchPDF = (account: Account, research: OrchestratedResearch | undefined) => {
  const doc = new jsPDF();
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = 170; // 210 - 2 * 20
  let y = 62;

  const accountName = account.name;

  // Helper to check and handle page breaks
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      
      // Mini-header on new pages
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`${accountName} - Account Intelligence Briefing`, margin, 12);
      doc.setDrawColor(220);
      doc.setLineWidth(0.5);
      doc.line(margin, 14, 210 - margin, 14);
      
      doc.setFontSize(10);
      doc.setTextColor(80);
      y = 20; // set starting y for content on new page
    }
  };

  // Helper to add auto-wrapped paragraph text
  const addText = (
    text: string, 
    fontSize: number = 10, 
    style: 'normal' | 'bold' | 'italic' = 'normal', 
    color: [number, number, number] = [80, 80, 80], 
    spacingBefore: number = 2, 
    spacingAfter: number = 4
  ) => {
    doc.setFont("Helvetica", style);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.45; // roughly 1.25 line-height in mm
    const blockHeight = lines.length * lineHeight;
    
    checkPageBreak(spacingBefore + blockHeight + spacingAfter);
    y += spacingBefore;
    
    lines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += lineHeight;
    });
    
    y += spacingAfter;
  };

  // Helper for Section Headers
  const addSectionHeader = (title: string) => {
    checkPageBreak(25);
    y += 4;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(9, 21, 64); // Navy blue: #091540
    doc.text(title, margin, y);
    y += 3;
    doc.setDrawColor(37, 99, 255); // Accent blue: #2563FF
    doc.setLineWidth(1);
    doc.line(margin, y, margin + 45, y);
    y += 5;
  };

  // Helper for Subsection Headers
  const addSubSectionHeader = (title: string) => {
    checkPageBreak(12);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(9, 21, 64);
    doc.text(title, margin, y);
    y += 4;
  };

  // Helper to draw clean visual cards/boxes (e.g. for key metrics, recommendations)
  const drawCard = (title: string, contentLines: string[], bgColor: [number, number, number] = [245, 247, 250], borderColor: [number, number, number] = [230, 235, 242]) => {
    const titleSize = 10;
    const bodySize = 9;
    const padding = 5;
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(titleSize);
    const wrappedTitle = doc.splitTextToSize(title, contentWidth - 2 * padding);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(bodySize);
    let totalBodyLines: string[] = [];
    contentLines.forEach(l => {
      const wrapped = doc.splitTextToSize(l, contentWidth - 2 * padding);
      totalBodyLines = [...totalBodyLines, ...wrapped];
    });

    const lineHeight = bodySize * 0.45;
    const cardHeight = padding * 2 + (wrappedTitle.length * (titleSize * 0.45)) + 3 + (totalBodyLines.length * lineHeight);

    checkPageBreak(cardHeight + 6);
    
    // Draw background
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentWidth, cardHeight, "FD");

    // Draw Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(titleSize);
    doc.setTextColor(9, 21, 64);
    
    let drawY = y + padding + (titleSize * 0.45) - 1;
    wrappedTitle.forEach((line: string) => {
      doc.text(line, margin + padding, drawY);
      drawY += (titleSize * 0.45);
    });

    // Separator line
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.line(margin + padding, drawY - 1, margin + contentWidth - padding, drawY - 1);
    drawY += 2;

    // Draw Content
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(bodySize);
    doc.setTextColor(60, 60, 60);

    totalBodyLines.forEach((line: string) => {
      doc.text(line, margin + padding, drawY);
      drawY += lineHeight;
    });

    y += cardHeight + 4;
  };

  // ==========================================
  // PAGE 1: COVER HEADER
  // ==========================================
  doc.setFillColor(9, 21, 64); // #091540 Navy
  doc.rect(0, 0, 210, 50, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("ACCOUNT INTEL REPORT", margin, 20);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(190, 210, 255);
  doc.text(`${accountName.toUpperCase()} - 11-STAGE AGENT PIPELINE ANALYSIS`, margin, 28);

  doc.setFontSize(9);
  doc.setTextColor(150, 160, 200);
  doc.text(`Target Industry: ${account.industry} | HQ: ${account.country} | Generated: ${new Date().toLocaleDateString()}`, margin, 36);

  // Opportunity Score Card top right
  doc.setFillColor(37, 99, 255); // #2563FF Accent
  doc.rect(150, 10, 42, 28, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("Opportunity Index", 154, 18);
  doc.setFontSize(16);
  doc.text(`${account.opportunityScore}%`, 154, 28);

  // Quick Executive Intro
  addSectionHeader("Executive Dossier Summary");
  addText(
    `This briefing package consolidates findings compiled by the Intellify 11-Stage autonomous research agent pipeline. This target account, ${account.name}, operates in the ${account.industry} sector. Our analysis indicates an opportunity suitability index of ${account.opportunityScore}%, based on cloud infrastructure maturity, strategic recruitment hiring trends, and public corporate statements.`,
    10,
    'normal',
    [60, 60, 60],
    4,
    6
  );

  if (!research || account.researchStatus !== 'Completed') {
    // Show Pending / Incomplete Research state
    addSectionHeader("Research State Pending");
    addText(
      "The multi-stage research pipeline has not completed synthesis for this target company. Please initialize and run the AI Research agent on the control center dashboard to map technology frameworks, financial indexes, and key co-innovation proposals.",
      11,
      'italic',
      [120, 60, 60],
      5,
      10
    );
  } else {
    // Compile and loop through each pipeline section
    const d = research.data;

    // 1. Company Discovery
    addSectionHeader("01. Company Discovery");
    if (d.company) {
      addText(`Overview: ${d.company.description}`, 10, 'normal', [60, 60, 60], 2, 4);
      
      // Basic info table
      drawCard("Firmographic Metrics", [
        `Legal Name: ${d.company.legalName}`,
        `Founded Year: ${d.company.founded}`,
        `Global Headquarters: ${d.company.headquarters}`,
        `Workforce Size: ${d.company.employees}`,
        `Target Sectors: ${d.company.sectors.join(', ')}`,
        `Core Competitors: ${d.company.competitors.join(', ')}`
      ]);
    } else {
      addText("Agent Discovery details currently pending.", 10, 'italic');
    }

    // 2. Business Analysis
    addSectionHeader("02. Business Analysis & SWOT");
    if (d.business) {
      addText(`Market Positioning: ${d.business.marketPosition}`, 10, 'normal', [60, 60, 60], 2, 4);
      
      const swot = d.business.swot;
      if (swot) {
        drawCard("SWOT Matrix Findings", [
          `Strengths: ${swot.strengths.slice(0, 3).join('; ')}`,
          `Weaknesses: ${swot.weaknesses.slice(0, 3).join('; ')}`,
          `Opportunities: ${swot.opportunities.slice(0, 3).join('; ')}`,
          `Threats: ${swot.threats.slice(0, 3).join('; ')}`
        ]);
      }
      
      if (d.business.keyOfferings) {
        addText(`Primary Offerings: ${d.business.keyOfferings.join(', ')}`, 9.5, 'bold', [80, 80, 80], 2, 4);
      }
    } else {
      addText("SWOT profiling currently pending.", 10, 'italic');
    }

    // 3. Technology Detection
    addSectionHeader("03. Technology Detection");
    if (d.technology) {
      addText(d.technology.summary, 10, 'normal', [60, 60, 60], 2, 6);
      
      addSubSectionHeader("Detected Infrastructure Components");
      d.technology.findings.forEach(f => {
        drawCard(`${f.technology} (${f.category}) - ${f.confidence}% Confident`, [
          `Business Impact: ${f.businessImpact}`,
          `Evidence gathered from: ${f.evidence.map(e => `${e.source} (${e.credibility} trust)`).join(', ')}`
        ]);
      });
    } else {
      addText("Infrastructure mapping currently pending.", 10, 'italic');
    }

    // 4. News Analysis
    addSectionHeader("04. Corporate News Analysis");
    if (d.news && d.news.length > 0) {
      d.news.forEach(item => {
        drawCard(`${item.title}`, [
          `Date: ${item.date} | Source: ${item.source} | Sentiment: ${item.sentiment}`,
          `Impact on Intellify Positioning: ${item.impact}`
        ]);
      });
    } else {
      addText("Press news analysis pending.", 10, 'italic');
    }

    // 5. Hiring Analysis
    addSectionHeader("05. Strategic Hiring & Talent Trends");
    if (d.hiring) {
      drawCard("Recruitment Profile Summary", [
        `Active Open Positions Indexed: ${d.hiring.openRoleCount}`,
        `Primary Recruitment Focus: ${d.hiring.focusAreas.join(', ')}`,
        `High Concentration Tech Skills in Demand: ${d.hiring.skillsInDemand.join(', ')}`
      ]);
      
      addSubSectionHeader("Indexed Recruitment Trends");
      d.hiring.trends.forEach(t => {
        addText(`• ${t}`, 9.5, 'normal', [70, 70, 70], 1, 2);
      });
    } else {
      addText("Hiring board mapping currently pending.", 10, 'italic');
    }

    // 6. Financial Analysis
    addSectionHeader("06. Financial Performance Index");
    if (d.financial) {
      drawCard("Core Fiscal Performance Indicators", [
        `Fiscal Period: FY ${d.financial.fiscalYear}`,
        `TTM Revenue: ${d.financial.revenue}`,
        `Net Income: ${d.financial.netIncome}`,
        `Growth Rate: ${d.financial.growthRate}`,
        `Annual R&D Spend: ${d.financial.rdSpend}`,
        `Estimated Digital Transformation Budget: ${d.financial.digitalBudgetEst}`
      ]);
      
      if (d.financial.metrics && d.financial.metrics.length > 0) {
        addSubSectionHeader("Siloed Segment Metrics");
        d.financial.metrics.forEach(m => {
          addText(`• ${m.metric}: ${m.value} (Trend: ${m.trend === 'Up' ? '▲ Upward' : '▬ Flat'})`, 9.5, 'normal', [70, 70, 70], 1, 2);
        });
      }
    } else {
      addText("Financial analysis currently pending.", 10, 'italic');
    }

    // 7. Strategic Priorities
    addSectionHeader("07. Corporate Strategic Priorities");
    if (d.strategic && d.strategic.length > 0) {
      d.strategic.forEach((p, idx) => {
        drawCard(`Priority ${idx+1}: ${p.priority} [${p.impactLevel} Impact]`, [
          `Strategic Focus details: ${p.details}`,
          `Target Completion Timeline: ${p.timeline}`
        ]);
      });
    } else {
      addText("Strategic priorities mapping currently pending.", 10, 'italic');
    }

    // 8. Buying Signals
    addSectionHeader("08. Intent & Buying Signals");
    if (d.signals && d.signals.length > 0) {
      d.signals.forEach(s => {
        drawCard(`Intent Trigger: "${s.signal}"`, [
          `Urgency Index: ${s.urgency} Action | Agent Confidence: ${s.confidence}%`,
          `Engagement Vector Recommendation: ${s.businessImpact}`
        ]);
      });
    } else {
      addText("Intent triggers mapping currently pending.", 10, 'italic');
    }

    // 9. Digital Maturity Assessment
    addSectionHeader("09. Digital Capability Maturity");
    if (d.maturity) {
      drawCard(`Overall Digital Maturity: ${d.maturity.overall}%`, [
        `Summary Assessment: ${d.maturity.assessment}`,
        `Cloud Adoption level: ${d.maturity.scores.cloud}%`,
        `AI / Data Science practices: ${d.maturity.scores.ai}%`,
        `Central Analytics / Data Platform: ${d.maturity.scores.dataPlatform}%`,
        `Compliance & Security posture: ${d.maturity.scores.security}%`,
        `CI/CD & DevOps Automation: ${d.maturity.scores.devops}%`
      ]);
    } else {
      addText("Digital maturity audits currently pending.", 10, 'italic');
    }

    // 10. Co-Innovation Opportunity Mapping
    addSectionHeader("10. Co-Innovation Opportunities & Workshop Guides");
    if (d.opportunities && d.opportunities.length > 0) {
      d.opportunities.forEach((opp, idx) => {
        drawCard(`Proposal ${idx+1}: ${opp.opportunity}`, [
          `Commercial Valuation: ${opp.estimatedBusinessValue} | Priority Alignment: ${opp.priority}`,
          `Recommended Offering: ${opp.recommendedOffering}`,
          `Suggested Intellify Accelerator: ${opp.suggestedAccelerator}`,
          `Workshop Pilot Blueprint: ${opp.suggestedWorkshop}`
        ]);
        
        if (opp.suggestedDiscoveryQuestions && opp.suggestedDiscoveryQuestions.length > 0) {
          addSubSectionHeader("Executive Discovery Call Questions");
          opp.suggestedDiscoveryQuestions.forEach((q, i) => {
            addText(`  Q${i+1}: "${q}"`, 9, 'italic', [50, 50, 150], 1, 3);
          });
          y += 2;
        }
      });
    } else {
      addText("Opportunities Mapping currently pending.", 10, 'italic');
    }

    // 11. Consolidated Executive Summary
    addSectionHeader("11. Consolidated Executive Strategy");
    if (d.executive) {
      drawCard("Consolidated Positioning Strategy", [
        d.executive.recommendedStrategy
      ], [9, 21, 64], [255, 255, 255]); // reverse colored card (Navy background)
      
      // Update text color for Navy card text drawing
      doc.setTextColor(255, 255, 255);
      
      drawCard("Briefing Summaries", [
        `Target Business Profile Summary: ${d.executive.businessSummary}`,
        `Target Tech Infrastructure Summary: ${d.executive.technologySummary}`
      ]);
      
      addSubSectionHeader("Key Risks, Initiatives & Offerings");
      drawCard("Executive Matrix Alignment", [
        `Active Initiatives: ${d.executive.currentInitiatives.join('; ')}`,
        `Critical Risks & Friction: ${d.executive.keyRisks.join('; ')}`,
        `Target Opportunities: ${d.executive.keyOpportunities.join('; ')}`,
        `Recommended Intellify Services: ${d.executive.recommendedIntellifyServices.join(', ')}`
      ]);
    } else {
      addText("Executive recommendations currently pending.", 10, 'italic');
    }
  }

  // Save the PDF
  const fileName = `${accountName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_research_dossier.pdf`;
  doc.save(fileName);
};


/**
 * Generates and downloads a beautifully styled PDF dossier of a single Stakeholder.
 */
export const exportStakeholderResearchPDF = (stakeholder: Stakeholder, account: Account, intel: StakeholderIntelligence) => {
  const doc = new jsPDF();
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = 170;
  let y = 62;

  const stakeholderName = stakeholder.name;

  // Helper to check and handle page breaks
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      
      // Mini-header on new pages
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`${stakeholderName} - Executive Profile Intelligence`, margin, 12);
      doc.setDrawColor(220);
      doc.setLineWidth(0.5);
      doc.line(margin, 14, 210 - margin, 14);
      
      doc.setFontSize(10);
      doc.setTextColor(80);
      y = 20;
    }
  };

  // Helper to add auto-wrapped paragraph text
  const addText = (
    text: string, 
    fontSize: number = 10, 
    style: 'normal' | 'bold' | 'italic' = 'normal', 
    color: [number, number, number] = [80, 80, 80], 
    spacingBefore: number = 2, 
    spacingAfter: number = 4
  ) => {
    doc.setFont("Helvetica", style);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.45;
    const blockHeight = lines.length * lineHeight;
    
    checkPageBreak(spacingBefore + blockHeight + spacingAfter);
    y += spacingBefore;
    
    lines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += lineHeight;
    });
    
    y += spacingAfter;
  };

  // Helper for Section Headers
  const addSectionHeader = (title: string) => {
    checkPageBreak(25);
    y += 4;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(9, 21, 64); // Navy
    doc.text(title, margin, y);
    y += 3;
    doc.setDrawColor(37, 99, 255); // Blue
    doc.setLineWidth(1);
    doc.line(margin, y, margin + 45, y);
    y += 5;
  };

  // Helper for Subsection Headers
  const addSubSectionHeader = (title: string) => {
    checkPageBreak(12);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(9, 21, 64);
    doc.text(title, margin, y);
    y += 4;
  };

  const drawCard = (title: string, contentLines: string[], bgColor: [number, number, number] = [245, 247, 250], borderColor: [number, number, number] = [230, 235, 242]) => {
    const titleSize = 10;
    const bodySize = 9;
    const padding = 5;
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(titleSize);
    const wrappedTitle = doc.splitTextToSize(title, contentWidth - 2 * padding);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(bodySize);
    let totalBodyLines: string[] = [];
    contentLines.forEach(l => {
      const wrapped = doc.splitTextToSize(l, contentWidth - 2 * padding);
      totalBodyLines = [...totalBodyLines, ...wrapped];
    });

    const lineHeight = bodySize * 0.45;
    const cardHeight = padding * 2 + (wrappedTitle.length * (titleSize * 0.45)) + 3 + (totalBodyLines.length * lineHeight);

    checkPageBreak(cardHeight + 6);
    
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentWidth, cardHeight, "FD");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(titleSize);
    doc.setTextColor(9, 21, 64);
    
    let drawY = y + padding + (titleSize * 0.45) - 1;
    wrappedTitle.forEach((line: string) => {
      doc.text(line, margin + padding, drawY);
      drawY += (titleSize * 0.45);
    });

    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.line(margin + padding, drawY - 1, margin + contentWidth - padding, drawY - 1);
    drawY += 2;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(bodySize);
    doc.setTextColor(60, 60, 60);

    totalBodyLines.forEach((line: string) => {
      doc.text(line, margin + padding, drawY);
      drawY += lineHeight;
    });

    y += cardHeight + 4;
  };

  // ==========================================
  // PAGE 1: COVER HEADER
  // ==========================================
  doc.setFillColor(9, 21, 64); // #091540 Navy
  doc.rect(0, 0, 210, 50, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(stakeholderName.toUpperCase(), margin, 20);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(190, 210, 255);
  doc.text(`${stakeholder.title} • ${stakeholder.department}`, margin, 28);

  doc.setFontSize(9);
  doc.setTextColor(150, 160, 200);
  doc.text(`Company: ${account.name} | Influence Level: ${stakeholder.influence} | Generated: ${new Date().toLocaleDateString()}`, margin, 36);

  // Influence Score card top right
  doc.setFillColor(244, 63, 94); // Rose color for influence
  doc.rect(150, 10, 42, 28, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("Influence Score", 154, 18);
  doc.setFontSize(16);
  doc.text(`${intel.influenceScore || 75}/100`, 154, 28);

  // Quick introduction
  addSectionHeader("Executive Summary");
  addText(
    `This dossier profiles ${stakeholder.name}, serving as ${stakeholder.title} inside the ${stakeholder.department} buying center of ${account.name}. We have mapped their strategic priorities, technology focus areas, communication style, and tailored discovery scripts to establish an ideal meeting approach.`,
    10,
    'normal',
    [60, 60, 60],
    4,
    6
  );

  // Profile Details Card
  drawCard("Identity Briefing", [
    `Name: ${stakeholder.name}`,
    `Job Title: ${stakeholder.title}`,
    `Department: ${stakeholder.department}`,
    `Primary Location: ${intel.basicInformation?.location || 'Redmond, WA'}`,
    `Corporate Email: ${stakeholder.email || intel.basicInformation?.email || 'N/A'}`,
    `Persona: ${intel.roleAssessment?.persona || 'Key Influencer'}`
  ]);

  // Role Assessment
  if (intel.roleAssessment) {
    addSectionHeader("Role & Influence Matrix");
    drawCard("Buying Center Authority", [
      `Decision Authority: ${intel.roleAssessment.decisionAuthority}`,
      `Technical Alignment Influence: ${intel.roleAssessment.technicalInfluence}`,
      `Business Case Influence: ${intel.roleAssessment.businessInfluence}`
    ]);
  }

  // KPIs & Challenges
  addSectionHeader("KPIs & Business Challenges");
  if (intel.likelyKPIs && intel.likelyKPIs.length > 0) {
    addSubSectionHeader("Likely Performance Indicators (KPIs)");
    intel.likelyKPIs.forEach(kpi => {
      addText(`• ${kpi}`, 9.5, 'normal', [70, 70, 70], 1, 2);
    });
  }

  if (intel.businessChallenges && intel.businessChallenges.length > 0) {
    addSubSectionHeader("Corporate Business Challenges");
    intel.businessChallenges.forEach(c => {
      addText(`• ${c}`, 9.5, 'normal', [70, 70, 70], 1, 2);
    });
  }

  // Technology & Priorities
  addSectionHeader("Technology Stacks & Strategic Priorities");
  if (intel.technologyFocus && intel.technologyFocus.length > 0) {
    addSubSectionHeader("Target Technology Stack Focus");
    addText(intel.technologyFocus.join(', '), 10, 'normal', [60, 60, 60], 2, 4);
  }

  if (intel.likelyPriorities && intel.likelyPriorities.length > 0) {
    addSubSectionHeader("Top Executive Priorities");
    intel.likelyPriorities.forEach(p => {
      addText(`• ${p}`, 9.5, 'normal', [70, 70, 70], 1, 2);
    });
  }

  // Approach & Communication
  addSectionHeader("Engagement & Approach Playbook");
  if (intel.communicationStyle) {
    addText(`Communication Style: ${intel.communicationStyle}`, 10, 'bold', [9, 21, 64], 2, 4);
  }
  if (intel.recommendedApproach) {
    drawCard("Recommended Approach Advice", [
      intel.recommendedApproach
    ]);
  }

  // Recommended Questions
  if (intel.recommendedQuestions && intel.recommendedQuestions.length > 0) {
    addSubSectionHeader("High-Impact Discovery Questions");
    intel.recommendedQuestions.forEach((q, idx) => {
      addText(`  Q${idx+1}: "${q}"`, 9.5, 'italic', [50, 50, 150], 2, 3);
    });
  }

  // Solutions Alignment
  if (intel.recommendedIntellifySolutions && intel.recommendedIntellifySolutions.length > 0) {
    addSectionHeader("Recommended Offerings & Solutions");
    intel.recommendedIntellifySolutions.forEach(s => {
      drawCard(s.solution, [
        `Relevance Strategy: ${s.whyRelevant}`
      ]);
    });
  }

  // Engagement Strategy Tab Details
  if (intel.engagementStrategy) {
    addSectionHeader("Buying Center Alignment Playbook");
    drawCard("Conversational Strategy", [
      `Ideal Opening Conversation: ${intel.engagementStrategy.bestOpeningConversation}`,
      `Business Case Alignment Angle: ${intel.engagementStrategy.businessAngle}`,
      `Technical Alignment Angle: ${intel.engagementStrategy.technologyAngle}`
    ]);

    drawCard("ABM Tactical Plays", [
      `Recommended Workshop: ${intel.engagementStrategy.recommendedWorkshop}`,
      `Relevant Accelerator Framework: ${intel.engagementStrategy.relevantAccelerator}`,
      `Relevant Case Study Reference: ${intel.engagementStrategy.relevantCaseStudy}`,
      `Suggested Next Meeting Agenda: ${intel.engagementStrategy.suggestedNextMeeting}`
    ]);

    if (intel.engagementStrategy.likelyObjections && intel.engagementStrategy.likelyObjections.length > 0) {
      addSubSectionHeader("Likely Buyer Objections & Handling");
      intel.engagementStrategy.likelyObjections.forEach((obj, idx) => {
        addText(`• Objection ${idx+1}: ${obj}`, 9.5, 'normal', [120, 50, 50], 1, 3);
      });
    }
  }

  // Discovery Questions Tab Details
  if (intel.discoveryQuestions && intel.discoveryQuestions.length > 0) {
    addSectionHeader("10 Detailed Discovery Questions");
    intel.discoveryQuestions.forEach((q, idx) => {
      addText(`  ${idx+1}. "${q}"`, 9.5, 'bold', [60, 60, 60], 1.5, 3);
    });
  }

  // Copywriting communication drafts
  if (intel.communicationPreview) {
    addSectionHeader("ABM Copywriting Communication Drafts");
    
    if (intel.communicationPreview.executiveEmail) {
      addSubSectionHeader("Cold outreach Executive Email Template");
      addText(intel.communicationPreview.executiveEmail, 9, 'normal', [50, 50, 50], 2, 4);
    }

    if (intel.communicationPreview.linkedInConnectionRequest) {
      addSubSectionHeader("LinkedIn Connection Pitch");
      addText(intel.communicationPreview.linkedInConnectionRequest, 9.5, 'italic', [70, 70, 70], 2, 4);
    }

    if (intel.communicationPreview.workshopInvitation) {
      addSubSectionHeader("Workshop Pilot Invitation");
      addText(intel.communicationPreview.workshopInvitation, 9.5, 'normal', [50, 50, 50], 2, 4);
    }

    if (intel.communicationPreview.meetingAgenda) {
      addSubSectionHeader("Aligned Meeting Agenda");
      addText(intel.communicationPreview.meetingAgenda, 9, 'normal', [50, 50, 50], 2, 4);
    }
  }

  // Save the PDF
  const fileName = `${stakeholderName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_briefing_profile.pdf`;
  doc.save(fileName);
};
