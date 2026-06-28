const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log(`[AUTH API] Registration attempt received for username: ${username}`);

  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing username or password fields' });
    }

    let user = await User.findOne({ username: username.trim() });
    if (user) {
      console.log(`[AUTH API] Registration rejected: Username "${username}" already exists.`);
      return res.status(400).json({ message: 'Username already taken' });
    }

    user = new User({ username: username.trim(), password });

    // Hash password before saving to DB
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();
    console.log(`[AUTH API] User document saved successfully in MongoDB for: ${username}`);

    const payload = { user: { id: user.id } };
    
    // Explicit token generation fallback tracking
    const secretKey = process.env.JWT_SECRET || 'cyber_glassmorphism_secret_canvas_key_2026';

    jwt.sign(payload, secretKey, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error('[AUTH API] JWT Signing Error:', err);
        throw err;
      }
      console.log(`[AUTH API] Token generated successfully for: ${username}`);
      res.status(201).json({ token, username: user.username });
    });
  } catch (err) {
    console.error('[AUTH API] Registration internal error crash log:', err.message);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

// LOGIN an existing user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`[AUTH API] Login verification request for username: ${username}`);

  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      console.log(`[AUTH API] Login failed: Username "${username}" not found.`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[AUTH API] Login failed: Incorrect password for "${username}".`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };
    const secretKey = process.env.JWT_SECRET || 'cyber_glassmorphism_secret_canvas_key_2026';

    jwt.sign(payload, secretKey, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error('[AUTH API] JWT Signing Error:', err);
        throw err;
      }
      console.log(`[AUTH API] Session established for user: ${username}`);
      res.json({ token, username: user.username });
    });
  } catch (err) {
    console.error('[AUTH API] Login internal error crash log:', err.message);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

module.exports = router;