const { callAI } = require('./groqAgent');

// ── TECHNICAL INTERVIEW AGENT ─────────────────────────────

const startTechnicalInterview = async (difficulty, topic) => {

  const stepA = await callAI(
    "You are a FAANG technical interviewer. Return ONLY raw JSON, no markdown, no explanation.",
    `Create a ${difficulty} ${topic} interview problem.
     Return: {
       title, description,
       examples: [{ input, output, explanation }],
       constraints: [string],
       followUpQuestions: [string]
     }`
  );

  const stepB = await callAI(
    "You are a Socratic coding mentor. Return ONLY raw JSON, no markdown, no explanation.",
    `Create 3 progressive hints for this problem.
     Each hint guides without giving away the answer.
     Problem: ${JSON.stringify(stepA)}
     Return: {
       hint1: string,
       hint2: string,
       hint3: string
     }`
  );

  return { problem: stepA, hints: stepB };
};

const evaluateTechnicalSolution = async (problem, code, language, timeUsed) => {

  const stepA = await callAI(
    "You are a code execution engine. Return ONLY raw JSON, no markdown, no explanation.",
    `Does this code correctly solve the problem?
     Problem: ${JSON.stringify(problem)}
     Code: ${code}, Language: ${language}
     Return: {
       isCorrect, failingCases: [string],
       edgeCasesCovered: [string],
       edgeCasesMissed: [string]
     }`
  );

  const stepB = await callAI(
    "You are a FAANG interviewer scoring a candidate. Return ONLY raw JSON, no markdown, no explanation.",
    `Score this interview submission.
     Problem: ${JSON.stringify(problem)}, Code: ${code}
     Test results: ${JSON.stringify(stepA)}
     Time used: ${timeUsed} minutes
     Return: {
       overallScore,
       correctnessScore,
       complexityScore,
       codeQualityScore,
       timeScore,
       strengths: [string],
       improvements: [string]
     }`
  );

  const stepC = await callAI(
    "You are a DSA mentor. Return ONLY raw JSON, no markdown, no explanation.",
    `Show the candidate what they should have done.
     Problem: ${JSON.stringify(problem)}, Their code: ${code}
     Assessment: ${JSON.stringify(stepB)}
     Return: {
       optimalSolution: { code, timeComplexity, spaceComplexity },
       keyInsight,
       practiceProblems: [{ name, difficulty, reason }]
     }`
  );

  return { testResults: stepA, assessment: stepB, teaching: stepC };
};

// ── HR VOICE INTERVIEW AGENT (stateful across 5 turns) ───

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
     
     Return: {
       sarahResponse: string,
       nextQuestion: string or null,
       evaluation: {
         score,
         starBreakdown: {
           situation: boolean,
           task: boolean,
           action: boolean,
           result: boolean
         },
         feedback: string,
         fillerWordsDetected: [string]
       },
       questionNumber: number,
       sessionComplete: boolean
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
    `Write a complete hiring assessment.
     Type: ${interviewType}
     Conversation: ${JSON.stringify(conversationHistory)}
     Evaluations: ${JSON.stringify(allEvaluations)}
     Return: {
       candidateSummary,
       overallScore,
       communicationScore,
       confidenceScore,
       starCompletenessScore,
       hiringRecommendation,
       recommendationReason,
       strengths: [string],
       redFlags: [string],
       improvements: [string],
       questionBreakdown: [{
         question, answer, score, starBreakdown, feedback
       }]
     }`
  );
};

module.exports = {
  startTechnicalInterview,
  evaluateTechnicalSolution,
  runHRSession,
  generateHRReport
};
