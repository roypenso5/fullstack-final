const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Grab token from the Authorization header or x-auth-token fallback
  const authHeader = req.header('Authorization');
  let token = req.header('x-auth-token');

  // If Authorization header is used, extract the token string dynamically
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7, authHeader.length).trim();
    } else {
      token = authHeader.trim();
    }
  }

  // Clear perimeter perimeter block check
  if (!token || token === 'null' || token === 'undefined') {
    console.error('[AUTH MIDDLEWARE] Access Denied: No valid token signature found in request.');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'cyber_glassmorphism_secret_canvas_key_2026';
    const decoded = jwt.verify(token, secretKey);
    
    req.user = decoded.user; // Bind user data to the request loop
    next();
  } catch (err) {
    console.error('[AUTH MIDDLEWARE] Token validation failed:', err.message);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};