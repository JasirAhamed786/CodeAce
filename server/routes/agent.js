const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { runSolverChain, runAnalyzerAgent, runPatternAgent, runReviewAgent, runCheatSheetAgent } = require('../services/geminiAgent');

// Helper to reliably save data for the frontend
const save = async (type, input, output, language, score = 0) => {
  let summary = `Completed ${type} agent.`;
  if (type === 'Problem Solver') summary = `Solved: ${output.classification?.pattern || 'Algorithm'}`;
  if (type === 'Pattern Recognizer') summary = `Detected: ${output.detection?.primaryPattern || 'Pattern'}`;
  if (type === 'Code Review') summary = `Scored: ${output.critique?.overallScore || score}/100`;
console.log("🔥 SAVING TO DB. Output looks like:", typeof output); // ADD THIS LINE
  // Provide a generic 'me' userId. 
  // CRITICAL FIX: Storing 'output' in the 'data' field so the frontend can read it!
  return await Session.create({ 
    userId: 'me', 
    type, 
    input, 
    data: output, // Mapping the AI's output to the 'data' field
    language, 
    score, 
    summary, 
    createdAt: new Date() 
  });
};

router.post('/solve', async (req, res) => {
  try {
    const result = await runSolverChain(req.body.problem, req.body.language);
    await save('Problem Solver', req.body.problem, result, req.body.language);
    res.json({ success: true, data: result });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/analyze', async (req, res) => {
  try {
    const result = await runAnalyzerAgent(req.body.code, req.body.language);
    await save('Complexity Analyzer', req.body.code, result, req.body.language);
    res.json({ success: true, data: result });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/patterns', async (req, res) => {
  try {
    const result = await runPatternAgent(req.body.problem, req.body.language);
    await save('Pattern Recognizer', req.body.problem, result, req.body.language);
    res.json({ success: true, data: result });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/review', async (req, res) => {
  try {
    const result = await runReviewAgent(req.body.code, req.body.problem, req.body.language);
    await save('Code Review', req.body.code, result, req.body.language, result.critique?.overallScore);
    res.json({ success: true, data: result });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/cheatsheet', async (req, res) => {
  try {
    const result = await runCheatSheetAgent(req.body.topic, req.body.language);
    await save('Cheat Sheet', req.body.topic, result, req.body.language);
    res.json({ success: true, data: result });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;