const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    default: 'guest' 
  },
  
  type: { 
    type: String, 
    required: true 
  },
  
  input: { 
    type: String 
  },
  
  // 👉 CHANGED 'output' to 'data' to match the frontend and route!
  data: { 
    type: mongoose.Schema.Types.Mixed 
  },
  
  language: { 
    type: String 
  },
  
  score: { 
    type: Number,
    default: 0
  },

  summary: { 
    type: String 
  },
  
  weakPatterns: [String],
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Session', SessionSchema);