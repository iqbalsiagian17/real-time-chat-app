const userSockets = {}; // { userId: Set(socketIds) }

function addUserSocket(userId, socketId) {
  if (!userSockets[userId]) userSockets[userId] = new Set();
  userSockets[userId].add(socketId);
}

function removeUserSocket(userId, socketId) {
  if (userSockets[userId]) {
    userSockets[userId].delete(socketId);
    if (userSockets[userId].size === 0) {
      delete userSockets[userId];
    }
  }
}

function getUserSockets(userId) {
  return userSockets[userId];
}

module.exports = {
  addUserSocket,
  removeUserSocket,
  getUserSockets,
  _debug_userSockets: userSockets, // ⬅️ tambahkan ini khusus debug
};
