export type PersonaType = 
  | 'tech_lead'
  | 'vc_investor'
  | 'executive_recruiter'
  | 'behavioral_coach'
  | 'consultant_case'
  | 'custom';

export interface PersonaInfo {
  id: PersonaType;
  name: string;
  role: string;
  avatar: string;
  tagline: string;
  description: string;
  tone: 'Encouraging & Structured' | 'Direct & Analytical' | 'Challenging & Hardball' | 'Empathetic & Insightful';
  badgeColor: string;
}

export interface STARBreakdown {
  situation: string;
  task: string;
  action: string;
  result: string;
  impactScore: number; // 0 - 100
  fillerWordsFound: string[];
  keyStrengths: string[];
  suggestedImprovement: string;
}

export interface InterviewTurn {
  id: string;
  turnIndex: number;
  question: string;
  questionContext?: string;
  userAnswer: string;
  aiFeedback?: {
    overallScore: number;
    clarityScore: number;
    starScore: number;
    depthScore: number;
    feedbackSummary: string;
    starBreakdown?: STARBreakdown;
    improvedAnswerSample: string;
  };
  followUpQuestion?: string;
  timestamp: string;
}

export interface SessionConfig {
  targetRole: string;
  companyName: string;
  industry: string;
  experienceLevel: 'Entry-Level' | 'Mid-Senior' | 'Lead / Principal' | 'Executive / Founder';
  persona: PersonaType;
  difficulty: 'Friendly & Supportive' | 'Realistic Standard' | 'Grill Mode / High Pressure';
  customContext?: string;
}

export interface InterviewSession {
  id: string;
  createdAt: string;
  config: SessionConfig;
  turns: InterviewTurn[];
  status: 'active' | 'completed';
  overallReport?: SessionReportData;
}

export interface SessionReportData {
  overallScore: number; // 0 - 100
  clarityScore: number;
  starAlignmentScore: number;
  confidenceScore: number;
  domainDepthScore: number;
  executivePresenceScore: number;
  summaryVerdict: string;
  topStrengths: string[];
  criticalGrowthAreas: string[];
  keyTakeaways: string[];
  recommendedPreparation: string[];
}

export interface PitchInput {
  productName: string;
  tagline: string;
  targetAudience: string;
  problem: string;
  solution: string;
  traction: string;
  ask: string;
}

export interface PitchOutput {
  thirtySecPitch: string;
  oneMinPitch: string;
  threeMinPitch: string;
  keyHooks: string[];
  potentialObjections: { objection: string; counterStrategy: string }[];
}

export interface HardballQuestion {
  id: string;
  question: string;
  category: 'Business Model' | 'Market & Competition' | 'Technical Feasibility' | 'Team & Execution' | 'Traction & Growth';
  whyTheyAskIt: string;
  frameworkToAnswer: string;
  idealResponseBulletPoints: string[];
}

export interface PracticeQuestion {
  id: string;
  category: 'Behavioral' | 'System Design' | 'Product Strategy' | 'Leadership' | 'Pitch & Venture';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prompt: string;
  frameworkType: 'STAR' | 'Rule of 3' | 'Pyramid Principle' | 'CIRCLES';
  idealKeywords: string[];
  tips: string;
}
