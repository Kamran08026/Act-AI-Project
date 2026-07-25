import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to initialize Gemini SDK safely
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY is missing or default. Will attempt request with available key if injected.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ------------------------------------------------------------------
// 1. Start Interview Session API
// ------------------------------------------------------------------
app.post("/api/interview/start", async (req, res) => {
  try {
    const { config } = req.body;
    const ai = getGeminiAI();

    const systemInstruction = `You are an expert, highly skilled interviewer named inside persona: ${config.persona}.
Target Position: ${config.targetRole}
Company: ${config.companyName || 'Top Tier Firm'}
Industry: ${config.industry || 'Technology'}
Candidate Level: ${config.experienceLevel}
Interview Style / Difficulty: ${config.difficulty}
Additional Context/Resume/JD: ${config.customContext || 'Standard high-bar interview'}

Your goal is to kick off an engaging, realistic interview session.
Return a JSON object matching this schema:
{
  "welcomeMessage": "A professional 2-sentence opening greeting as your persona set up the stage.",
  "firstQuestion": "The first targeted, realistic question tailored to the role/context.",
  "questionContext": "Brief 1-sentence tip on what you are looking for in this question."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Start the interview now with the first question.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            welcomeMessage: { type: Type.STRING },
            firstQuestion: { type: Type.STRING },
            questionContext: { type: Type.STRING },
          },
          required: ["welcomeMessage", "firstQuestion"],
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/interview/start:", error);
    res.status(500).json({
      welcomeMessage: "Welcome to your PrepMind session! Let's dive right in.",
      firstQuestion: "To start off, please tell me about yourself and why you're interested in this role.",
      questionContext: "Highlight your key achievements and core value proposition concise and clearly.",
      error: error.message,
    });
  }
});

// ------------------------------------------------------------------
// 2. Interview Turn Processing API (Evaluate Answer + Follow-Up)
// ------------------------------------------------------------------
app.post("/api/interview/turn", async (req, res) => {
  try {
    const { config, previousTurns, currentQuestion, userAnswer } = req.body;
    const ai = getGeminiAI();

    const systemInstruction = `You are the interviewer persona (${config.persona}) conducting a ${config.difficulty} interview for ${config.targetRole} at ${config.companyName || 'Target Company'}.

Candidate just answered this question:
Question: "${currentQuestion}"
Candidate Answer: "${userAnswer}"

Analyze the answer rigorously. Evaluate:
1. STAR Framework (Situation, Task, Action, Result) completeness.
2. Filler words / weak language (e.g. "like", "um", "maybe", "I guess").
3. Quantifiable impact & metrics.
4. Depth and clarity.

Also generate a realistic follow-up or next logical interview question.

Return JSON adhering strictly to:
{
  "overallScore": integer (0-100),
  "clarityScore": integer (0-100),
  "starScore": integer (0-100),
  "depthScore": integer (0-100),
  "feedbackSummary": "2-3 concise bulleted sentences evaluating what was strong and what was lacking.",
  "starBreakdown": {
    "situation": "Briefly extracted Situation from answer or 'Missing'",
    "task": "Briefly extracted Task from answer or 'Missing'",
    "action": "Briefly extracted Action from answer or 'Missing'",
    "result": "Briefly extracted Result/Impact from answer or 'Missing'",
    "impactScore": integer (0-100),
    "fillerWordsFound": ["list", "of", "filler", "phrases"],
    "keyStrengths": ["Strength 1", "Strength 2"],
    "suggestedImprovement": "Single most high-leverage improvement advice"
  },
  "improvedAnswerSample": "A rewritten, polished STAR-formatted version of candidate's answer.",
  "followUpQuestion": "Your next follow-up question or probing question based on what they just said."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Evaluate the candidate's response and provide feedback and follow-up question.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            clarityScore: { type: Type.INTEGER },
            starScore: { type: Type.INTEGER },
            depthScore: { type: Type.INTEGER },
            feedbackSummary: { type: Type.STRING },
            starBreakdown: {
              type: Type.OBJECT,
              properties: {
                situation: { type: Type.STRING },
                task: { type: Type.STRING },
                action: { type: Type.STRING },
                result: { type: Type.STRING },
                impactScore: { type: Type.INTEGER },
                fillerWordsFound: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                keyStrengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                suggestedImprovement: { type: Type.STRING },
              },
              required: ["situation", "task", "action", "result", "impactScore", "suggestedImprovement"],
            },
            improvedAnswerSample: { type: Type.STRING },
            followUpQuestion: { type: Type.STRING },
          },
          required: ["overallScore", "feedbackSummary", "improvedAnswerSample", "followUpQuestion"],
        },
      },
    });

    const jsonText = response.text || "{}";
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error("Error in /api/interview/turn:", error);
    res.status(500).json({
      overallScore: 78,
      clarityScore: 80,
      starScore: 75,
      depthScore: 78,
      feedbackSummary: "Good structural response. Include more explicit quantifiable metrics in your Result section.",
      starBreakdown: {
        situation: "Set context clearly.",
        task: "Outlined core objective.",
        action: "Explained steps taken.",
        result: "Good outcome, but could add specific % or $ metrics.",
        impactScore: 75,
        fillerWordsFound: ["you know", "kind of"],
        keyStrengths: ["Clear action steps", "Good ownership"],
        suggestedImprovement: "Quantify the final result with concrete metrics.",
      },
      improvedAnswerSample: "In my previous project, when faced with tight deadlines, I streamlined our pipeline which reduced delivery time by 35%.",
      followUpQuestion: "Can you dive deeper into the specific metrics you tracked to verify that 35% improvement?",
      error: error.message,
    });
  }
});

// ------------------------------------------------------------------
// 3. Complete Session Scorecard & Report API
// ------------------------------------------------------------------
app.post("/api/interview/evaluate", async (req, res) => {
  try {
    const { session } = req.body;
    const ai = getGeminiAI();

    const systemInstruction = `You are a Senior Bar Raiser & Hiring Board Director. Evaluate the entire completed interview transcript.
Target Role: ${session.config.targetRole}
Company: ${session.config.companyName || 'Target Company'}

Transcript:
${JSON.stringify(session.turns, null, 2)}

Provide a comprehensive, executive-level final evaluation scorecard.
JSON Schema:
{
  "overallScore": integer (0-100),
  "clarityScore": integer (0-100),
  "starAlignmentScore": integer (0-100),
  "confidenceScore": integer (0-100),
  "domainDepthScore": integer (0-100),
  "executivePresenceScore": integer (0-100),
  "summaryVerdict": "Comprehensive 3-sentence verdict on hiring readiness.",
  "topStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "criticalGrowthAreas": ["Area 1", "Area 2", "Area 3"],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2"],
  "recommendedPreparation": ["Action item 1", "Action item 2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Generate final session scorecard report.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            clarityScore: { type: Type.INTEGER },
            starAlignmentScore: { type: Type.INTEGER },
            confidenceScore: { type: Type.INTEGER },
            domainDepthScore: { type: Type.INTEGER },
            executivePresenceScore: { type: Type.INTEGER },
            summaryVerdict: { type: Type.STRING },
            topStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalGrowthAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedPreparation: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["overallScore", "summaryVerdict", "topStrengths", "criticalGrowthAreas"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/interview/evaluate:", error);
    res.status(500).json({
      overallScore: 82,
      clarityScore: 85,
      starAlignmentScore: 80,
      confidenceScore: 84,
      domainDepthScore: 81,
      executivePresenceScore: 83,
      summaryVerdict: "Solid overall interview performance. Demonstrates strong problem-solving skills and domain familiarity.",
      topStrengths: ["Clear communication structure", "Strong ownership mentality", "Articulate explanations"],
      criticalGrowthAreas: ["Include precise quantitative impact metrics", "Minimize minor filler phrases", "Be more concise in initial situation setup"],
      keyTakeaways: ["Your technical fundamentals are strong", "Focus on executive summary style delivery"],
      recommendedPreparation: ["Prepare 3 core STAR stories with dollar/percentage metrics", "Practice elevator pitches under 60 seconds"],
      error: error.message,
    });
  }
});

// ------------------------------------------------------------------
// 4. Instant Answer Framer / Transformer API
// ------------------------------------------------------------------
app.post("/api/reframe", async (req, res) => {
  const { rawAnswer = "", targetFormat = "STAR", roleContext = "" } = req.body || {};
  try {
    const ai = getGeminiAI();

    const systemInstruction = `You are a world-class Executive Communication & Interview Coach.
Transform this raw, unstructured, or rambly answer into a pristine, high-impact ${targetFormat || 'STAR'} formatted response.
Context/Role: ${roleContext || 'General Professional Interview'}

Raw Answer: "${rawAnswer}"

Output structured JSON:
{
  "originalWordCount": integer,
  "formattedWordCount": integer,
  "originalRaw": "${rawAnswer}",
  "situation": "Clean Situation sentence",
  "task": "Clean Task sentence",
  "action": "Clean Action bullet points or narrative",
  "result": "Clean Result sentence with metrics",
  "fullPolishedScript": "Complete, ready-to-speak polished answer script.",
  "executiveSummary": "1-sentence elevator version for quick delivery.",
  "fillerWordsRemoved": ["list", "of", "weak", "phrases", "removed"],
  "impactScore": integer (0-100),
  "coachKeyTip": "1 practical tip on vocal delivery for this answer."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Reframe the raw answer now.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalWordCount: { type: Type.INTEGER },
            formattedWordCount: { type: Type.INTEGER },
            originalRaw: { type: Type.STRING },
            situation: { type: Type.STRING },
            task: { type: Type.STRING },
            action: { type: Type.STRING },
            result: { type: Type.STRING },
            fullPolishedScript: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            fillerWordsRemoved: { type: Type.ARRAY, items: { type: Type.STRING } },
            impactScore: { type: Type.INTEGER },
            coachKeyTip: { type: Type.STRING },
          },
          required: ["fullPolishedScript", "situation", "task", "action", "result", "executiveSummary"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/reframe:", error);
    res.status(500).json({
      originalWordCount: rawAnswer ? rawAnswer.split(' ').length : 20,
      formattedWordCount: 45,
      originalRaw: rawAnswer || '',
      situation: "In my previous team, we faced tight release deadlines.",
      task: "My objective was to optimize server deployment latency.",
      action: "I refactored our CI/CD pipeline and introduced parallel testing steps.",
      result: "This reduced build times by 40% and enabled zero-downtime deploys.",
      fullPolishedScript: `In my previous role, we faced tight deployment deadlines. My objective was to optimize server deployment latency. I refactored our CI/CD pipeline and introduced parallel testing steps. Consequently, build times decreased by 40% and enabled seamless zero-downtime deploys.`,
      executiveSummary: "Refactored CI/CD pipeline to cut build times by 40% under tight release deadlines.",
      fillerWordsRemoved: ["like", "um", "you know"],
      impactScore: 88,
      coachKeyTip: "Pause for 1 second after stating the 40% metric to let the impact sink in.",
      error: error.message,
    });
  }
});

// ------------------------------------------------------------------
// 5. Pitch Deck & Elevator Pitch Generator API
// ------------------------------------------------------------------
app.post("/api/pitch/generate", async (req, res) => {
  const pitchInput = req.body?.pitchInput || {};
  try {
    const ai = getGeminiAI();

    const systemInstruction = `You are a Silicon Valley VC Partner and YC Elevator Pitch Coach.
Generate 3 distinct pitch versions (30 seconds, 60 seconds, 3 minutes) plus strategic hooks based on these project details:
Product/App Name: ${pitchInput.productName || 'My Startup'}
Tagline: ${pitchInput.tagline || ''}
Target Audience: ${pitchInput.targetAudience || ''}
Problem: ${pitchInput.problem || ''}
Solution: ${pitchInput.solution || ''}
Traction: ${pitchInput.traction || ''}
Ask/Goal: ${pitchInput.ask || ''}

Return JSON:
{
  "thirtySecPitch": "Spoken 30-second punchy pitch (~75 words).",
  "oneMinPitch": "Comprehensive 60-second elevator pitch (~150 words).",
  "threeMinPitch": "Detailed 3-minute pitch structure with problem, solution, TAM, moat, unit economics, ask.",
  "keyHooks": ["Hook 1", "Hook 2", "Hook 3"],
  "potentialObjections": [
    { "objection": "Objection 1", "counterStrategy": "How to answer" },
    { "objection": "Objection 2", "counterStrategy": "How to answer" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Generate elevator pitches now.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            thirtySecPitch: { type: Type.STRING },
            oneMinPitch: { type: Type.STRING },
            threeMinPitch: { type: Type.STRING },
            keyHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
            potentialObjections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  objection: { type: Type.STRING },
                  counterStrategy: { type: Type.STRING },
                },
                required: ["objection", "counterStrategy"],
              },
            },
          },
          required: ["thirtySecPitch", "oneMinPitch", "threeMinPitch", "keyHooks"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/pitch/generate:", error);
    res.status(500).json({
      thirtySecPitch: `${pitchInput.productName || 'PrepMind'} is an AI platform solving ${pitchInput.problem || 'interview anxiety'} for ${pitchInput.targetAudience || 'job candidates'}. With ${pitchInput.solution || 'live simulations'}, we achieve instant results. We have ${pitchInput.traction || 'strong traction'} and are raising ${pitchInput.ask || 'funding'}.`,
      oneMinPitch: `Every year, millions of ${pitchInput.targetAudience || 'candidates'} struggle with ${pitchInput.problem || 'interview anxiety'}. Existing solutions are slow and fragmented. Enter ${pitchInput.productName || 'PrepMind'}: ${pitchInput.tagline || 'AI Studio'}. By combining AI automation with seamless workflows, we deliver ${pitchInput.solution || 'interactive practice'}. Currently we have ${pitchInput.traction || 'strong validation'}. We are looking for ${pitchInput.ask || 'support'} to scale our reach.`,
      threeMinPitch: `Detailed 3-minute presentation script covering problem validation, market opportunity, product demo flow, competitive moat, traction metrics, and strategic ask.`,
      keyHooks: ["High-growth TAM opportunity", "Proprietary AI flywheel", "Strong early traction"],
      potentialObjections: [
        { objection: "Why won't incumbents build this?", counterStrategy: "Emphasize focus, specialized speed, and proprietary data model." }
      ],
      error: error.message,
    });
  }
});

// ------------------------------------------------------------------
// 6. Hardball Question Generator API
// ------------------------------------------------------------------
app.post("/api/pitch/hardball", async (req, res) => {
  try {
    const { context } = req.body;
    const ai = getGeminiAI();

    const systemInstruction = `You are a tough VC investor / Senior Interviewer known for aggressive, penetrating hardball questions.
Context: ${context}

Generate 5 extremely sharp, hardball questions that could trip up an unprepared candidate or founder, along with why it's asked and bulletproof answer frameworks.

Return JSON:
{
  "hardballQuestions": [
    {
      "id": "hb-1",
      "question": "The question",
      "category": "Business Model" | "Market & Competition" | "Technical Feasibility" | "Team & Execution" | "Traction & Growth",
      "whyTheyAskIt": "Why the interviewer asks this",
      "frameworkToAnswer": "Rule/Framework to structure the answer",
      "idealResponseBulletPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Generate 5 hardball questions now.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hardballQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  category: { type: Type.STRING },
                  whyTheyAskIt: { type: Type.STRING },
                  frameworkToAnswer: { type: Type.STRING },
                  idealResponseBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["question", "category", "whyTheyAskIt", "frameworkToAnswer", "idealResponseBulletPoints"],
              },
            },
          },
          required: ["hardballQuestions"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/pitch/hardball:", error);
    res.status(500).json({
      hardballQuestions: [
        {
          id: "hb-1",
          question: "What happens to your customer retention when competitor X slashes prices by 50%?",
          category: "Market & Competition",
          whyTheyAskIt: "To test whether your product has real switching costs or if you are purely competing on price.",
          frameworkToAnswer: "Defensive Value Anchor",
          idealResponseBulletPoints: [
            "Acknowledge price pressure.",
            "Highlight core integration workflow that creates high switching costs.",
            "Demonstrate ROI delivered that far outweighs the pricing difference."
          ]
        }
      ],
      error: error.message,
    });
  }
});

// ------------------------------------------------------------------
// Vite Server Integration (Dev vs Prod)
// ------------------------------------------------------------------
async function startServer() {
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
    console.log(`PrepMind AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
