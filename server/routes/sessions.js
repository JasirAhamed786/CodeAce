const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

router.get('/:userId', async (req, res) => {
  try {
    const rawSessions = await Session.find({ userId: req.params.userId }).sort({ createdAt: -1, timestamp: -1 });
    
    // Safety mapping: Ensures the React UI ALWAYS gets the fields it expects
    const safeSessions = rawSessions.map(s => ({
      _id: s._id,
      type: s.type || s.mode || 'Unknown Session',
      summary: s.summary || s.input?.substring(0, 50) + '...' || 'Session completed.',
      createdAt: s.createdAt || s.timestamp || new Date(),
      score: s.score || 0
    }));

    res.json({ success: true, data: safeSessions });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.delete('/:userId', async (req, res) => {
  try {
    const result = await Session.deleteMany({ userId: req.params.userId });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;