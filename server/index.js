/**
 * CodeAce server index
 *
 * Setup instructions:
 * 1. Get free Groq API key at console.groq.com (no credit card)
 * 2. Get free MongoDB URI at mongodb.com/atlas (free 512MB cluster)
 * 3. Add both to server/.env
 *    GROQ_API_KEY=your_groq_key_here
 *    MONGODB_URI=your_mongodb_uri_here
 *    PORT=5000
 * 4. Run: npm run install:all
 * 5. Run: npm run dev
 * 6. Open http://localhost:3000
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
// Allow CORS from any origin during development (adjust for production)
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/agent',    require('./routes/agent'));
app.use('/api/mock',     require('./routes/mock'));
app.use('/api/sessions', require('./routes/sessions'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile' });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
