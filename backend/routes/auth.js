const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const tokenCookieConfig = {
  httpOnly: true, // Prevents XSS script read attacks
  secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
  sameSite: 'strict', // Mitigates CSRF vulnerabilities
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
};

// REGISTER User
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username: username.trim() });
    if (user) return res.status(400).json({ message: 'Username already taken' });

    user = new User({ username: username.trim(), password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    const secretKey = process.env.JWT_SECRET || 'cyber_glassmorphism_secret_canvas_key_2026';

    jwt.sign(payload, secretKey, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, tokenCookieConfig);
      res.status(201).json({ username: user.username });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN User
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username.trim() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { user: { id: user.id } };
    const secretKey = process.env.JWT_SECRET || 'cyber_glassmorphism_secret_canvas_key_2026';

    jwt.sign(payload, secretKey, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, tokenCookieConfig);
      res.json({ username: user.username });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGOUT User (Wipe Cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', { ...tokenCookieConfig, maxAge: 0 });
  res.json({ message: 'Session closed successfully' });
});

// GET user info + favorites array mapping
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;