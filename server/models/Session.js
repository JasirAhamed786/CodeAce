const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId:       { type: String, default: 'guest' },
  mode:         { type: String, enum: [
                  'solve','analyze','patterns','review',
                  'cheatsheet','mock-technical','mock-hr'
                ]},
  input:        String,
  output:       mongoose.Schema.Types.Mixed,
  language:     String,
  score:        Number,
  weakPatterns: [String],
  timestamp:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
