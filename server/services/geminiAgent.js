const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini SDK if the key exists
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// ── BASE CALLER ──────────────────────────────────────────
const callAI = async (systemPrompt, userMessage) => {
  const useGemini = !!process.env.GEMINI_API_KEY;

  if (!useGemini && !process.env.GROQ_API_KEY) {
    throw new Error('Missing GROQ_API_KEY or GEMINI_API_KEY in server/.env');
  }

  try {
    let text = '';

    if (useGemini) {
      const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.2 // Lowered to guarantee strict JSON formatting
        }
      });
      text = response.text;
    } else {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 4000, 
          temperature: 0.2
        },
        { headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 120000 }
      );
      text = response.data.choices[0].message.content;
    }

    // ── AGGRESSIVE JSON EXTRACTOR ──
    let cleanText = String(text).replace(/```json|```/g, '').trim();
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleanText);
  } catch (e) {
    let detail = e.message;
    if (e.response && e.response.data) detail = JSON.stringify(e.response.data);
    throw new Error(`AI Agent failed: ${detail}`);
  }
};

// ── AGENT 1: PROBLEM SOLVER (Full-Fidelity Mega-Prompt) ────────────────
const runSolverChain = async (problem, language) => {
  return await callAI(
    "You are a FAANG Principal Engineer and DSA Architect. Return ONLY valid JSON.",
    `Solve this problem entirely in one step. Problem: ${problem} | Language: ${language}
    Return EXACTLY this JSON structure:
    {
      "classification": { "pattern": "string", "confidence": 0, "reasoning": "string", "timeHint": "string", "spaceHint": "string" },
      "plan": { "bruteForceApproach": "string", "optimalApproach": "string", "keyInsight": "string", "tradeoff": "string" },
      "solutions": {
        "brute": { "code": "string", "timeComplexity": "string", "spaceComplexity": "string", "explanation": "string" },
        "optimal": { "code": "string", "timeComplexity": "string", "spaceComplexity": "string", "explanation": "string" }
      },
      "critique": { "edgeCases": ["string"], "improvements": ["string"], "interviewTips": ["string"], "commonMistakes": ["string"] }
    }`
  );
};

// ── AGENT 2: COMPLEXITY ANALYZER (Full-Fidelity) ─────────────────────────
const runAnalyzerAgent = async (code, language) => {
  return await callAI(
    "You are a computer science professor. Return ONLY valid JSON matching the structure.",
    `Analyze this ${language} code completely.\nCode: ${code}
    Return EXACTLY this JSON structure:
    {
      "timeComplexity": "string",
      "spaceComplexity": "string",
      "lineByLineAnalysis": [{ "line": "string", "operation": "string", "complexityContribution": "string" }],
      "bottleneck": "string",
      "dominantTerm": "string",
      "optimizationSuggestions": [{ "suggestion": "string", "expectedImprovement": "string" }],
      "improvedCode": "string"
    }`
  );
};

// ── AGENT 3: PATTERN RECOGNIZER (Full-Fidelity Mega-Prompt) ────────────
const runPatternAgent = async (problem, language) => {
  return await callAI(
    "You are a DSA Pattern Expert. Return ONLY valid JSON.",
    `Analyze this problem and provide the pattern template. Problem: ${problem} | Language: ${language}
    Return EXACTLY this JSON structure:
    {
      "detection": {
        "primaryPattern": "string",
        "confidence": 0,
        "whyThisPattern": "string",
        "alternativePatterns": [{ "name": "string", "reason": "string", "tradeoff": "string" }]
      },
      "expansion": {
        "patternTemplate": "string",
        "similarProblems": [{ "name": "string", "difficulty": "string", "number": 0, "whySimilar": "string" }],
        "templateExplanation": "string",
        "keyVariables": "string"
      }
    }`
  );
};

// ── AGENT 4: CODE REVIEW (Full-Fidelity Mega-Prompt) ───────────────────
const runReviewAgent = async (code, problem, language) => {
  return await callAI(
    "You are a strict FAANG code reviewer. Return ONLY valid JSON.",
    `Review this code against the problem. Code: ${code} | Problem: ${problem} | Language: ${language}
    Return EXACTLY this JSON structure:
    {
      "understanding": { "understanding": "string", "isCorrect": true, "majorIssues": ["string"] },
      "critique": {
        "overallScore": 0,
        "bugs": [{ "line": 0, "issue": "string", "fix": "string" }],
        "edgeCasesMissed": ["string"],
        "styleIssues": ["string"]
      },
      "refactor": { "refactoredCode": "string", "changesExplained": ["string"], "seniorTips": ["string"] }
    }`
  );
};

// ── AGENT 5: CHEAT SHEET GENERATOR (Full-Fidelity Mega-Prompt) ─────────
const runCheatSheetAgent = async (topic, language) => {
  return await callAI(
    "You are a DSA Curriculum Designer. Return ONLY valid JSON.",
    `Create a comprehensive cheat sheet. Topic: ${topic} | Language: ${language}
    Return EXACTLY this JSON structure:
    {
      "structure": {
        "corePatterns": ["string"],
        "mustKnowAlgorithms": ["string"],
        "commonMistakes": ["string"]
      },
      "content": {
        "title": "string",
        "patterns": [{ "name": "string", "template": "string", "timeComplexity": "string", "spaceComplexity": "string", "whenToUse": "string" }],
        "tips": ["string"],
        "commonMistakes": ["string"],
        "mustKnowProblems": [{ "name": "string", "difficulty": "string", "pattern": "string", "keyIdea": "string" }]
      }
    }`
  );
};

module.exports = {
  callAI,
  runSolverChain,
  runAnalyzerAgent,
  runPatternAgent,
  runReviewAgent,
  runCheatSheetAgent
};