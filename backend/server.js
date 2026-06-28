const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Set to true to allow any local port to connect automatically during rapid testing
const LOCAL_DEVELOPMENT_MODE = true; 

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:4174',
  'https://fullstack-final.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (LOCAL_DEVELOPMENT_MODE && origin && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

if (!process.env.MONGO_URI) {
  console.error("CRITICAL ERROR: MONGO_URI is missing from environment layout parameters.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database connected successfully!'))
  .catch((err) => console.error('Database connection error:', err));

// Route Handlers
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/recipes', require('./routes/recipes.js'));

app.get('/', (req, res) => {
  res.send('Server engine is live and running with JWT core extensions.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});