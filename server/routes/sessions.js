const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// GET all sessions for a user
router.get('/:userId', async (req, res) => {
  try {
    const rawSessions = await Session.find({ userId: req.params.userId }).sort({ createdAt: -1, timestamp: -1 });
    
    // Safety mapping: Ensures the React UI ALWAYS gets the fields it expects
    const safeSessions = rawSessions.map(s => ({
      _id: s._id,
      type: s.type || s.mode || 'Unknown Session',
      summary: s.summary || s.input?.substring(0, 50) + '...' || 'Session completed.',
      createdAt: s.createdAt || s.timestamp || new Date(),
      score: s.score || 0,
      
      // ✅ ADDED THIS LINE: Now the AI JSON is actually sent to React!
      data: s.data 
    }));

    res.json({ success: true, data: safeSessions });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE ONE session by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedSession = await Session.findByIdAndDelete(req.params.id);
    if (!deletedSession) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// DELETE ALL sessions for a user (Changed path to avoid clashing with /:id)
router.delete('/user/:userId', async (req, res) => {
  try {
    const result = await Session.deleteMany({ userId: req.params.userId });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;