const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Message, User, Conversation, Participant, UnreadMessage } = require('../models');
const SECRET_KEY = process.env.JWT_SECRET || 'rahasia';

// 🧠 Simpan semua socket aktif berdasarkan user_id
const userSockets = {}; // key: user.id, value: Set of socket.id

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // 🔐 Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Unauthorized'));

    try {
      const user = jwt.verify(token, SECRET_KEY);
      socket.user = user;
      next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`🟢 ${socket.user.username} connected (${socket.id})`);

    // Tambahkan socket ke daftar aktif
    if (!userSockets[userId]) {
      userSockets[userId] = new Set();
    }
    userSockets[userId].add(socket.id);

    // 📩 Kirim pesan
    socket.on('sendMessage', async (data) => {
      const { conversation_id, content, type = 'text' } = data;

      try {
        const message = await Message.create({
          conversation_id,
          sender_id: userId,
          content,
          type,
        });

        const participants = await Participant.findAll({ where: { conversation_id } });

        const unreadEntries = participants
          .filter(p => p.user_id !== userId)
          .map(p => ({ user_id: p.user_id, message_id: message.id }));
        await UnreadMessage.bulkCreate(unreadEntries);

        const fullMessage = await Message.findByPk(message.id, {
          include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
        });

        // Kirim ke semua peserta yang online
        participants.forEach(p => {
          const sockets = userSockets[p.user_id];
          if (sockets) {
            sockets.forEach(sid => io.to(sid).emit('receiveMessage', fullMessage));
          }
        });
      } catch (err) {
        console.error('❌ Error sendMessage:', err.message);
        socket.emit('errorMessage', 'Gagal mengirim pesan.');
      }
    });

    // 📦 Buat percakapan baru
    socket.on('createConversation', async (data) => {
      const { user_ids, name } = data;

      try {
        const allUserIds = [...user_ids, userId];
        const isGroup = user_ids.length > 1;

        const conversation = await Conversation.create({ is_group: isGroup, name });
        await Participant.bulkCreate(allUserIds.map(uid => ({
          conversation_id: conversation.id,
          user_id: uid,
        })));

        const newConv = await Conversation.findByPk(conversation.id, {
          include: [{ model: User, attributes: ['id', 'username'] }],
        });

        allUserIds.forEach(uid => {
          const sockets = userSockets[uid];
          if (sockets) {
            sockets.forEach(sid => io.to(sid).emit('newConversation', newConv));
          }
        });
      } catch (err) {
        console.error('❌ Error creating conversation:', err.message);
        socket.emit('errorMessage', 'Gagal membuat percakapan.');
      }
    });

    // 🔴 Saat disconnect
    socket.on('disconnect', () => {
      console.log(`🔴 ${socket.user.username} disconnected`);
      const sockets = userSockets[userId];
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          delete userSockets[userId];
        }
      }
    });
  });
}

module.exports = initSocket;
