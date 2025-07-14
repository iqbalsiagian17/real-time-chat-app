const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'rahasia';

module.exports = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));

  try {
    const user = jwt.verify(token, SECRET_KEY);
    socket.user = user;
    next();
  } catch {
    return next(new Error('Invalid token'));
  }
};
