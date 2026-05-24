// Ensure this points to your updated geminiAgent.js where callAI resides
const { callAI } = require('./geminiAgent');

// ── TECHNICAL INTERVIEW AGENT (Mega-Prompts) ─────────────────

const startTechnicalInterview = async (difficulty, topic) => {
  return await callAI(
    "You are a FAANG technical interviewer and Socratic mentor. Return ONLY raw JSON, no markdown, no explanation.",
    `Create a ${difficulty} ${topic} interview problem, and provide 3 progressive hints that guide the user without giving away the answer.
     
     Return EXACTLY this JSON structure:
     {
       "problem": {
         "title": "string",
         "description": "string",
         "examples": [{ "input": "string", "output": "string", "explanation": "string" }],
         "constraints": ["string"],
         "followUpQuestions": ["string"]
       },
       "hints": {
         "hint1": "string",
         "hint2": "string",
         "hint3": "string"
       }
     }`
  );
};

const evaluateTechnicalSolution = async (problem, code, language, timeUsed) => {
  return await callAI(
    "You are a code execution engine, FAANG interviewer, and DSA mentor. Return ONLY raw JSON, no markdown, no explanation.",
    `Evaluate this candidate's submission completely.
     Problem: ${JSON.stringify(problem)}
     Code: ${code}
     Language: ${language}
     Time used: ${timeUsed} minutes
     
     Return EXACTLY this JSON structure:
     {
       "testResults": {
         "isCorrect": true,
         "failingCases": ["string"],
         "edgeCasesCovered": ["string"],
         "edgeCasesMissed": ["string"]
       },
       "assessment": {
         "overallScore": 0,
         "correctnessScore": 0,
         "complexityScore": 0,
         "codeQualityScore": 0,
         "timeScore": 0,
         "strengths": ["string"],
         "improvements": ["string"]
       },
       "teaching": {
         "optimalSolution": { "code": "string", "timeComplexity": "string", "spaceComplexity": "string" },
         "keyInsight": "string",
         "practiceProblems": [{ "name": "string", "difficulty": "string", "reason": "string" }]
       }
     }`
  );
};

// ── HR VOICE INTERVIEW AGENT (Stateful) ──────────────────────

const runHRSession = async (
  conversationHistory,
  userAnswer,
  questionNumber,
  interviewType
) => {
  return await callAI(
    `You are Sarah, a senior HR manager at a top tech company.
     You have 10 years of interviewing experience.
     You are conducting a ${interviewType} interview.
     Never reveal you are an AI. Stay in character completely.
     Evaluate every answer using the STAR framework.
     Ask exactly 5 questions total, one per call.
     Return ONLY raw JSON, no markdown, no explanation.`,
    `Interview so far: ${JSON.stringify(conversationHistory)}
     Question number: ${questionNumber}
     Candidate's answer: "${userAnswer}"
     
     If questionNumber is 0, give opening + first question.
     Otherwise evaluate the answer and give the next question.
     
     Return EXACTLY this JSON structure:
     {
       "sarahResponse": "string",
       "nextQuestion": "string",
       "evaluation": {
         "score": 0,
         "starBreakdown": {
           "situation": true,
           "task": true,
           "action": true,
           "result": true
         },
         "feedback": "string",
         "fillerWordsDetected": ["string"]
       },
       "questionNumber": 0,
       "sessionComplete": false
     }`
  );
};

const generateHRReport = async (
  conversationHistory,
  allEvaluations,
  interviewType
) => {
  return await callAI(
    "You are a senior HR director writing a candidate assessment. Return ONLY raw JSON, no markdown, no explanation.",
    `Write a complete, professional hiring assessment.
     Type: ${interviewType}
     Conversation: ${JSON.stringify(conversationHistory)}
     Evaluations: ${JSON.stringify(allEvaluations)}
     
     Return EXACTLY this JSON structure:
     {
       "candidateSummary": "string",
       "overallScore": 0,
       "communicationScore": 0,
       "confidenceScore": 0,
       "starCompletenessScore": 0,
       "hiringRecommendation": "string",
       "recommendationReason": "string",
       "strengths": ["string"],
       "redFlags": ["string"],
       "improvements": ["string"],
       "questionBreakdown": [{
         "question": "string",
         "answer": "string",
         "score": 0,
         "starBreakdown": { "situation": true, "task": true, "action": true, "result": true },
         "feedback": "string"
       }]
     }`
  );
};
const simulateCodeRun = async (code, language, problemTitle) => {
  return await callAI(
    "You are a strict, unforgiving code compiler and execution engine simulator. Return ONLY raw JSON, no markdown.",
    `Simulate compiling and running this code for the problem: "${problemTitle}".
     The user explicitly selected the language: ${language}.
     
     Code to compile: 
     \n${code}\n
     
     CRITICAL INSTRUCTIONS:
     1. LANGUAGE CHECK: First, verify that the code syntax actually matches ${language}. If the code is clearly written in a completely different language (e.g., Python code submitted when Java is selected), you MUST reject it. Return success: false and output a realistic compiler syntax error (e.g., "error: class, interface, or enum expected" if expecting Java). Do NOT execute the code.
     2. SYNTAX CHECK: If the language matches but has syntax errors, return success: false and the exact error trace.
     3. EXECUTE: If it is valid ${language} and runs successfully, simulate exactly what the console output would be based on the logic.
     
     Return EXACTLY this JSON structure:
     {
       "success": true,
       "output": "string of the simulated console output or error trace"
     }`
  );
};
module.exports = {
  startTechnicalInterview,
  evaluateTechnicalSolution,
  runHRSession,
  generateHRReport,
  simulateCodeRun
};