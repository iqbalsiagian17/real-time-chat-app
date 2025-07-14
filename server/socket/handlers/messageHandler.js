const { Message, User, Participant, UnreadMessage, Conversation } = require('../../models');
const { getUserSockets } = require('../utils/userSockets');

async function handleSendMessage(io, socket, data) {
  const { conversation_id, content, type = 'text' } = data;
  const userId = socket.user.id;

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

    // ✅ Emit ke semua peserta: pesan & update conversation
    for (const p of participants) {
      const sockets = getUserSockets(p.user_id);
      if (sockets) {
        sockets.forEach(sid => {
          io.to(sid).emit('receiveMessage', fullMessage);

          // ✅ Emit update data conversation untuk sidebar
          io.to(sid).emit('conversationUpdated', {
            conversation_id,
            lastMessage: fullMessage,
            unreadCount: p.user_id === userId ? 0 : 1,
          });
        });
      }
    }
  } catch (err) {
    console.error('❌ Error sendMessage:', err.message);
    socket.emit('errorMessage', 'Gagal mengirim pesan.');
  }
}

module.exports = {
  handleSendMessage,
};
