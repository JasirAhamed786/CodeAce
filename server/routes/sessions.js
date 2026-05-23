const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

router.get('/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId })
      .sort({ timestamp: -1 });
    res.json({ success: true, data: sessions });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/:userId/weakpatterns', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId });
    const counts = {};
    sessions.forEach(s => {
      const p = s.output?.classification?.pattern
             || s.output?.detection?.primaryPattern;
      if (p) counts[p] = (counts[p] || 0) + 1;
    });
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([pattern, count]) => ({ pattern, count }));
    res.json({ success: true, data: sorted });
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
