const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

// Helper function to pause execution and avoid rate limits
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize Gemini SDK if the key exists
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// ── BASE CALLER ──────────────────────────────────────────
// Handles proper formatting for both Google Gemini SDK and Groq REST API
const callAI = async (systemPrompt, userMessage) => {
  const useGemini = !!process.env.GEMINI_API_KEY;

  if (!useGemini && !process.env.GROQ_API_KEY) {
    throw new Error('Missing GROQ_API_KEY or GEMINI_API_KEY in server/.env');
  }

  try {
    let text = '';

    // ── NATIVE GEMINI SDK ROUTE ──
    if (useGemini) {
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });
      
      text = response.text;
    } 
    // ── GROQ FALLBACK ROUTE ──
    else {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 2000,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );
      text = response.data.choices[0].message.content;
    }

    // ── AGGRESSIVE JSON EXTRACTOR (FIX FOR HTTP 500) ──
    let cleanText = String(text).replace(/```json|```/g, '').trim();
    
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleanText);

  } catch (e) {
    let detail = e.message;
    if (e.response && e.response.data) {
      detail = JSON.stringify(e.response.data);
    }
    throw new Error(`AI Agent step failed: ${detail}`);
  }
};

// ── AGENT 1: PROBLEM SOLVER (4-step reasoning chain) ─────
const runSolverChain = async (problem, language) => {
  const step1 = await callAI(
    "You are a DSA classification expert. Think step by step. Return ONLY valid JSON matching the exact keys requested.",
    `Identify the DSA pattern for this problem.\nProblem: ${problem}\nReturn structure: { "pattern": "string", "confidence": number, "reasoning": "string", "timeHint": "string", "spaceHint": "string" }`
  );

  await sleep(2000); // Prevent Rate Limit
  const step2 = await callAI(
    "You are a solution architect. Return ONLY valid JSON matching the exact keys requested.",
    `For a ${step1.pattern} problem, plan both approaches.\nProblem: ${problem}\nReturn structure: { "bruteForceApproach": "string", "optimalApproach": "string", "keyInsight": "string", "tradeoff": "string" }`
  );

  await sleep(2000); // Prevent Rate Limit
  const step3 = await callAI(
    `You are a senior ${language} engineer. Return ONLY valid JSON matching the exact keys requested.`,
    `Write both solutions for this problem.\nPattern: ${step1.pattern}\nPlan: ${JSON.stringify(step2)}\nProblem: ${problem}\nReturn structure: { "brute": { "code": "string", "timeComplexity": "string", "spaceComplexity": "string", "explanation": "string" }, "optimal": { "code": "string", "timeComplexity": "string", "spaceComplexity": "string", "explanation": "string" } }`
  );

  await sleep(2000); // Prevent Rate Limit
  const step4 = await callAI(
    "You are a FAANG principal engineer doing code review. Return ONLY valid JSON matching the exact keys requested.",
    `Critically review these solutions.\nSolutions: ${JSON.stringify(step3)}\nProblem: ${problem}\nReturn structure: { "edgeCases": ["string"], "improvements": ["string"], "interviewTips": ["string"], "commonMistakes": ["string"] }`
  );

  return { classification: step1, plan: step2, solutions: step3, critique: step4 };
};

// ── AGENT 2: COMPLEXITY ANALYZER ─────────────────────────
const runAnalyzerAgent = async (code, language) => {
  return await callAI(
    "You are a complexity analysis professor. Walk through EVERY line before concluding. Return ONLY valid JSON matching the exact keys requested.",
    `Analyze this ${language} code completely.\nCode: ${code}\nReturn structure: { "timeComplexity": "string", "spaceComplexity": "string", "lineByLineAnalysis": [{ "line": "string", "operation": "string", "complexityContribution": "string" }], "bottleneck": "string", "dominantTerm": "string", "optimizationSuggestions": [{ "suggestion": "string", "expectedImprovement": "string" }], "improvedCode": "string" }`
  );
};

// ── AGENT 3: PATTERN RECOGNIZER (2-step chain) ───────────
const runPatternAgent = async (problem, language) => {
  const stepA = await callAI(
    "You are a DSA pattern expert. Return ONLY valid JSON matching the exact keys requested.",
    `Identify all applicable patterns for: ${problem}\nReturn structure: { "primaryPattern": "string", "confidence": number, "whyThisPattern": "string", "alternativePatterns": [{ "name": "string", "reason": "string", "tradeoff": "string" }] }`
  );

  await sleep(2000); // Prevent Rate Limit
  const stepB = await callAI(
    "You are a DSA teacher. Return ONLY valid JSON matching the exact keys requested.",
    `For the ${stepA.primaryPattern} pattern applied to: ${problem}\nLanguage: ${language}\nReturn structure: { "patternTemplate": "string", "similarProblems": [{ "name": "string", "difficulty": "string", "number": number, "whySimilar": "string" }], "templateExplanation": "string", "keyVariables": "string" }`
  );

  return { detection: stepA, expansion: stepB };
};

// ── AGENT 4: CODE REVIEW (3-step chain) ──────────────────
const runReviewAgent = async (code, problem, language) => {
  const stepA = await callAI(
    "You are a senior engineer. Return ONLY valid JSON matching the exact keys requested.",
    `What is this code trying to do and does it work?\nCode: ${code}, Problem: ${problem}\nReturn structure: { "understanding": "string", "isCorrect": true, "majorIssues": ["string"] }`
  );

  await sleep(2000); // Prevent Rate Limit
  const stepB = await callAI(
    "You are a FAANG code reviewer. Return ONLY valid JSON matching the exact keys requested.",
    `Give a harsh but fair code review.\nCode: ${code}\nUnderstanding: ${JSON.stringify(stepA)}\nReturn structure: { "overallScore": number, "bugs": [{ "line": number, "issue": "string", "fix": "string" }], "edgeCasesMissed": ["string"], "styleIssues": ["string"] }`
  );

  await sleep(2000); // Prevent Rate Limit
  const stepC = await callAI(
    "You are a clean code expert. Return ONLY valid JSON matching the exact keys requested.",
    `Rewrite this code to be production quality.\nOriginal: ${code}\nReview: ${JSON.stringify(stepB)}\nReturn structure: { "refactoredCode": "string", "changesExplained": ["string"], "seniorTips": ["string"] }`
  );

  return { understanding: stepA, critique: stepB, refactor: stepC };
};

// ── AGENT 5: CHEAT SHEET GENERATOR (2-step chain) ────────
const runCheatSheetAgent = async (topic, language) => {
  const stepA = await callAI(
    "You are a DSA curriculum designer. Return ONLY valid JSON matching the exact keys requested.",
    `Design a complete cheat sheet structure for ${topic}.\nReturn structure: { "corePatterns": ["string"], "mustKnowAlgorithms": ["string"], "commonMistakes": ["string"] }`
  );

  await sleep(2000); // Prevent Rate Limit
  const stepB = await callAI(
    "You are a DSA expert teacher. Return ONLY valid JSON matching the exact keys requested.",
    `Write the full cheat sheet content.\nTopic: ${topic}, Language: ${language}\nStructure: ${JSON.stringify(stepA)}\nReturn structure: { "title": "string", "patterns": [{ "name": "string", "template": "string", "timeComplexity": "string", "spaceComplexity": "string", "whenToUse": "string" }], "tips": ["string"], "commonMistakes": ["string"], "mustKnowProblems": [{ "name": "string", "difficulty": "string", "pattern": "string", "keyIdea": "string" }] }`
  );

  return { structure: stepA, content: stepB };
};

module.exports = {
  callAI,
  runSolverChain,
  runAnalyzerAgent,
  runPatternAgent,
  runReviewAgent,
  runCheatSheetAgent
};