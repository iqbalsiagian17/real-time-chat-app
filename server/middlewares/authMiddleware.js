const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'rahasia';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Token not provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // id, username
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
