const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// 1. Import the Mock Interview functions from mockAgent.js
const {
  startTechnicalInterview,
  evaluateTechnicalSolution,
  runHRSession,
  generateHRReport,
  simulateCodeRun
} = require('../services/mockAgent'); // ✅ FIXED FILE PATH

// 2. Import the Cheat Sheet function from geminiAgent.js
const {
  runCheatSheetAgent 
} = require('../services/geminiAgent');

// Helper to save sessions matching your NEW Session.js schema
const saveSession = (type, input, output, score = 0) => {
  return Session.create({
    type, 
    input,
    data: output, // ✅ FIXED: Changed 'output' to 'data' to match schema!
    score,
    createdAt: new Date()
  });
};

router.post('/technical/start', async (req, res) => {
  try {
    const { difficulty, topic } = req.body;
    const result = await startTechnicalInterview(difficulty, topic);
    const session = await saveSession('Mock Technical', topic, result);
    res.json({ success: true, data: result, sessionId: session._id });
  } catch (e) {
    console.error("Start Interview Error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});
router.post('/technical/run', async (req, res) => {
  try {
    const { code, language, problemTitle } = req.body;
    const result = await simulateCodeRun(code, language, problemTitle);
    res.json({ success: true, data: result });
  } catch (e) {
    console.error("Simulation Error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/technical/evaluate', async (req, res) => {
  try {
    const { problem, code, language, timeUsed, sessionId } = req.body;
    
    // 1. Get the evaluation from the agent
    const result = await evaluateTechnicalSolution(problem, code, language, timeUsed);
    
    // 2. Language Validation Check
    const aiCode = result.teaching?.optimalSolution?.code || "";
    if (language === 'python' && aiCode.includes('function') && !aiCode.includes('def')) {
        console.warn("DEBUG: AI returned JavaScript instead of Python syntax.");
    }
    
    // 3. Update the existing session
    await Session.findByIdAndUpdate(sessionId, {
      data: result, // ✅ FIXED: Changed 'output' to 'data'
      score: result.assessment?.overallScore || 0
    });
    
    res.json({ success: true, data: result });
  } catch (e) {
    console.error("Evaluation Error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/cheat-sheet', async (req, res) => {
  try {
    const { topic, language } = req.body;
    const result = await runCheatSheetAgent(topic, language);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/hr/message', async (req, res) => {
  try {
    const { conversationHistory, userAnswer, questionNumber, interviewType } = req.body;
    const result = await runHRSession(conversationHistory, userAnswer, questionNumber, interviewType);
    res.json({ success: true, data: result });
  } catch (e) {
    console.error("HR Message Error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/hr/report', async (req, res) => {
  try {
    const { conversationHistory, allEvaluations, interviewType } = req.body;
    const result = await generateHRReport(conversationHistory, allEvaluations, interviewType);
    
    await saveSession(
      'Mock HR', 
      interviewType, 
      result, 
      result.overallScore || 0
    );
    
    res.json({ success: true, data: result });
  } catch (e) {
    console.error("HR Report Error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;