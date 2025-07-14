const { Server } = require('socket.io');
const authMiddleware = require('./middleware/auth');
const { User } = require('../models');
const { addUserSocket, removeUserSocket, getUserSockets,_debug_userSockets } = require('./utils/userSockets');
const { handleSendMessage } = require('./handlers/messageHandler');
const { handleCreateConversation } = require('./handlers/conversationHandler');
const { handleTyping, handleStopTyping } = require('./handlers/typingHandler');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.use(authMiddleware);

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    console.log(`🟢 ${socket.user.username} (${userId}) connected with socket ${socket.id}`);
    addUserSocket(userId, socket.id);
    console.log('📌 userSockets state:', JSON.stringify(Object.fromEntries(
      Object.entries(_debug_userSockets).map(([k, v]) => [k, Array.from(v)])
    )));

    socket.on('typing', (data) => handleTyping(io, socket, data));
    socket.on('stopTyping', (data) => handleStopTyping(io, socket, data));



    try {
      await User.update({ is_online: true }, { where: { id: userId } });

      // ✅ Emit ke semua client bahwa user online
      socket.broadcast.emit('userOnline', {
        user_id: userId,
        is_online: true,
      });
    } catch (err) {
      console.error('❌ Gagal update is_online:', err.message);
    }

    socket.on('sendMessage', (data) => handleSendMessage(io, socket, data));
    socket.on('createConversation', (data) => handleCreateConversation(io, socket, data));

    socket.on('joinConversation', ({ conversation_id }) => {
      const room = `conversation_${conversation_id}`;
      socket.join(room);
      console.log(`🔗 Socket ${socket.id} joined room ${room}`);
    });

    socket.on('joinConversation', ({ conversation_id }) => {
  const room = `conversation_${conversation_id}`;
  socket.join(room);
  console.log(`🔗 Socket ${socket.id} joined room ${room}`);
});

socket.on('typing', (data) => {
  console.log(`✍️ Typing from ${data.username} in conversation_${data.conversation_id}`);
  handleTyping(io, socket, data);
});

    socket.on('disconnect', async () => {
      console.log(`🔴 ${socket.user.username} disconnected`);
      removeUserSocket(userId, socket.id);

      const stillConnected = getUserSockets(userId);
      if (!stillConnected || stillConnected.size === 0) {
        try {
          const now = new Date();
          await User.update({ is_online: false, last_seen: now }, { where: { id: userId } });

          // ✅ Emit ke semua bahwa user offline
          socket.broadcast.emit('userOnline', {
            user_id: userId,
            is_online: false,
            last_seen: now.toISOString(),
          });
        } catch (err) {
          console.error('❌ Gagal update last_seen:', err.message);
        }
      }
    });
  });
}

module.exports = initSocket;
