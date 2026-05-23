const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const {
  runSolverChain,
  runAnalyzerAgent,
  runPatternAgent,
  runReviewAgent,
  runCheatSheetAgent
} = require('../services/groqAgent');

const save = (mode, input, output, language, score) =>
  Session.create({ mode, input, output, language, score });

router.post('/solve', async (req, res) => {
  try {
    const { problem, language } = req.body;
    const result = await runSolverChain(problem, language);
    await save('solve', problem, result, language);
    res.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;
    const result = await runAnalyzerAgent(code, language);
    await save('analyze', code, result, language);
    res.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/patterns', async (req, res) => {
  try {
    const { problem, language } = req.body;
    const result = await runPatternAgent(problem, language);
    await save('patterns', problem, result, language);
    res.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/review', async (req, res) => {
  try {
    const { code, problem, language } = req.body;
    const result = await runReviewAgent(code, problem, language);
    await save('review', code, result, language, result.critique?.overallScore);
    res.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/cheatsheet', async (req, res) => {
  try {
    const { topic, language } = req.body;
    const result = await runCheatSheetAgent(topic, language);
    await save('cheatsheet', topic, result, language);
    res.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
