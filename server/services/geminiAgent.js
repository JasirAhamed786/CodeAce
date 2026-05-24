const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// ── THE INVINCIBLE PARSER (Base Caller) ─────────────────────────
const callAI = async (systemPrompt, userMessage) => {
  const useGemini = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");

  if (!useGemini && !process.env.GROQ_API_KEY) {
    throw new Error('Missing GROQ_API_KEY or GEMINI_API_KEY in server/.env');
  }

  // 👉 FIXED: Moved outside the try block so the catch block can safely read it
  let text = ''; 

  try {
    const fullSystemPrompt = `${systemPrompt} Return ONLY a raw JSON object. Do not include markdown code blocks, do not include conversational text, do not include explanations.`;

    if (useGemini) {
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userMessage,
        config: { systemInstruction: fullSystemPrompt, responseMimeType: 'application/json', temperature: 0.1 }
      });
      text = response.text;
    } else {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: fullSystemPrompt }, { role: 'user', content: userMessage }],
        max_tokens: 4000, temperature: 0.1
      }, { headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 120000 });
      text = response.data.choices[0].message.content;
    }

    // ── THE INVINCIBLE CLEANER ──
    // Strip everything before the first '{' and after the last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error("No JSON object found");

    let cleanText = text.substring(start, end + 1)
                        .replace(/```json|```/g, '')
                        .replace(/[\r\n]+/g, " "); // Flatten newlines to prevent parsing errors

    return JSON.parse(cleanText);
  } catch (e) {
    // Now it can safely read 'text' here if Groq throws an error!
    console.error("AI Parse Error. Raw Output:", text);
    throw new Error(`AI Agent parsing failed: ${e.message}`);
  }
};

// ── AGENTS ──────────────────────────────────────────────────────────────

const runSolverChain = async (problem, language) => {
  return await callAI(
    `You are a strict FAANG Principal Engineer. You MUST populate EVERY field in the JSON schema. Do not leave 'explanation', 'edgeCases', or 'interviewTips' empty. Return JSON only.`,
    `Problem to solve: ${problem}. 
    LANGUAGE: ${language}. 
    
    You MUST return a JSON object with this EXACT structure, filling in ALL detailed string explanations and arrays:
    {
      "classification": { 
        "pattern": "string (e.g. Sliding Window)", 
        "confidence": 95, 
        "reasoning": "string" 
      },
      "plan": { 
        "keyInsight": "string" 
      },
      "solutions": { 
        "brute": { 
          "code": "string", 
          "timeComplexity": "string", 
          "spaceComplexity": "string", 
          "explanation": "Detailed explanation of how the brute force code works." 
        }, 
        "optimal": { 
          "code": "string", 
          "timeComplexity": "string", 
          "spaceComplexity": "string", 
          "explanation": "Detailed explanation of how the optimal code works." 
        } 
      }, 
      "critique": { 
        "edgeCases": ["Specify edge case 1", "Specify edge case 2"], 
        "interviewTips": ["Actionable tip 1", "Actionable tip 2"] 
      } 
    }`
  );
};

const runAnalyzerAgent = async (code, language) => {
  return await callAI(
    `You are a strict CS Professor. You MUST populate EVERY field in the JSON schema. Do not leave 'lineByLineAnalysis' or 'optimizationSuggestions' empty. Return JSON only.`,
    `Analyze this ${language} code: ${code}. 
    
    You MUST return a JSON object with this EXACT structure, filling in ALL arrays with detailed data:
    { 
      "isValid": true, 
      "error": null, 
      "timeComplexity": "O(n)", 
      "spaceComplexity": "O(n)", 
      "bottleneck": "Detailed explanation of the bottleneck", 
      "dominantTerm": "The dominating math term",
      "lineByLineAnalysis": [
        { "line": "for i := 0; i < n; i++", "operation": "Looping through array", "complexityContribution": "O(n)" },
        { "line": "sum += i", "operation": "Addition", "complexityContribution": "O(1)" }
      ],
      "optimizationSuggestions": [
        { "suggestion": "Actionable advice on how to improve this.", "expectedImprovement": "O(n) -> O(log n)" }
      ],
      "improvedCode": "Write the improved code here" 
    }`
  );
};

const runPatternAgent = async (problem, language) => {
  return await callAI(
    `You are a strict Senior FAANG Interviewer. You MUST populate EVERY field in the JSON schema. Do not leave 'similarProblems' or 'alternativePatterns' empty. Return JSON only.`,
    `Analyze this problem description: "${problem}". 
    Target Language: ${language}.
    
    You MUST return a JSON object with this EXACT structure, filling in ALL arrays with detailed data:
    {
      "detection": {
        "primaryPattern": "string (e.g. Sliding Window)",
        "confidence": 95,
        "whyThisPattern": "Detailed explanation based on problem keywords.",
        "alternativePatterns": [
          { "name": "Prefix Sum", "reason": "Could also work if...", "tradeoff": "Uses O(N) space" }
        ]
      },
      "expansion": {
        "patternTemplate": "Provide the actual code template in the requested language",
        "templateExplanation": "Explain how the template works.",
        "keyVariables": "List key variables (e.g., left, right, window_sum)",
        "similarProblems": [
          { "name": "Maximum Subarray", "number": 53, "difficulty": "Medium", "whySimilar": "Uses the same contiguous subarray concept." }
        ]
      }
    }`
  );
};

const runReviewAgent = async (code, problem, language) => {
  return await callAI(
    `You are a FAANG reviewer. Return valid JSON only. Booleans must be true/false.`,
    `Code: ${code}. Return JSON: { "understanding": { "isCorrect": true }, "critique": { "overallScore": 10, "bugs": [] }, "refactor": { "refactoredCode": "string" } }`
  );
};

const runCheatSheetAgent = async (topic, language) => {
  return await callAI(
    `You are a DSA Curriculum Designer. Return JSON only.`,
    `Create cheat sheet for: ${topic}. Return JSON: { "title": "string", "overview": "string", "patterns": [{"name": "string", "template": "string", "complexity": "string"}], "tips": ["string"], "mustKnowProblems": ["string"] }`
  );
};

module.exports = { callAI, runSolverChain, runAnalyzerAgent, runPatternAgent, runReviewAgent, runCheatSheetAgent };