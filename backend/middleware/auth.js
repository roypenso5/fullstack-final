const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Grab token directly from cookies
  const token = req.cookies ? req.cookies.token : null;

  if (!token) {
    return res.status(401).json({ message: 'No token session established. Access Denied.' });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'cyber_glassmorphism_secret_canvas_key_2026';
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session signature invalid or expired.' });
  }
};