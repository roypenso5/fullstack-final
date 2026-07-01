const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:4174',
  'https://fullstack-final.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (origin && origin.startsWith('http://localhost:')) return callback(null, true);
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // CRITICAL: Allows browser to send secure cookies back and forth
}));

app.use(express.json({ limit: '10mb' })); // Increased limit to safely handle Base64 image strings
app.use(cookieParser()); // Intercepts cookie headers automatically

if (!process.env.MONGO_URI) {
  console.error("CRITICAL ERROR: MONGO_URI is missing.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database connected successfully!'))
  .catch((err) => console.error('Database connection error:', err));

app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/recipes', require('./routes/recipes.js'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));