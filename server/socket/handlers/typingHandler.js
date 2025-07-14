// socketHandlers/typingHandler.js

function handleTyping(io, socket, data) {
  const { conversation_id, user_id, username } = data;

  // Broadcast ke peserta lain di percakapan
  socket.to(`conversation_${conversation_id}`).emit('userTyping', {
    user_id,
    username,   
  });
}

function handleStopTyping(io, socket, data) {
  const { conversation_id, user_id } = data;

  socket.to(`conversation_${conversation_id}`).emit('userStopTyping', {
    user_id,
  });
}

module.exports = {
  handleTyping,
  handleStopTyping,
};
