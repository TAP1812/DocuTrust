const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'docutrust_secret_key';

// Middleware xác thực JWT, lấy token từ cookie hoặc header
function auth(req, res, next) {
  let token = null;
  // Ưu tiên lấy từ cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else {
    // Nếu không có cookie, lấy từ header
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

module.exports = auth;
