const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const {
  startTechnicalInterview,
  evaluateTechnicalSolution,
  runHRSession,
  generateHRReport
} = require('../services/mockAgent');

// Helper to save sessions matching your new Session.js schema
const saveSession = (type, input, output, score = 0) => {
  return Session.create({
    type, // Using the new 'type' field
    input,
    output,
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
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/technical/evaluate', async (req, res) => {
  try {
    const { problem, code, language, timeUsed, sessionId } = req.body;
    const result = await evaluateTechnicalSolution(problem, code, language, timeUsed);
    
    // Update the session started in /technical/start
    await Session.findByIdAndUpdate(sessionId, {
      output: result,
      score: result.assessment?.overallScore || 0
    });
    
    res.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/hr/message', async (req, res) => {
  try {
    const { conversationHistory, userAnswer, questionNumber, interviewType } = req.body;
    const result = await runHRSession(conversationHistory, userAnswer, questionNumber, interviewType);
    res.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
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
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;