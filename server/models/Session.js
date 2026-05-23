const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    default: 'guest' 
  },
  
  // Changed from restrictive 'mode' enum to a flexible 'type' string.
  // This matches the frontend expectations (e.g., "Problem Solver", "Code Review")
  type: { 
    type: String, 
    required: true 
  },
  
  input: { 
    type: String 
  },
  
  // This safely holds the massive JSON objects returned by the Mega-Prompts
  output: { 
    type: mongoose.Schema.Types.Mixed 
  },
  
  language: { 
    type: String 
  },
  
  score: { 
    type: Number,
    default: 0
  },

  // Added this field so your Session History dashboard has clean, readable subtitles
  summary: { 
    type: String 
  },
  
  weakPatterns: [String],
  
  // Changed from 'timestamp' to standard 'createdAt' to match React Date formatting
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Session', SessionSchema);