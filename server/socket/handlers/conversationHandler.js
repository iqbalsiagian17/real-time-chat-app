const { Conversation, Participant, User } = require('../../models');
const { getUserSockets } = require('../utils/userSockets');

async function handleCreateConversation(io, socket, data) {
  const { user_ids, name } = data;
  const userId = socket.user.id;

  try {
    const allUserIds = [...user_ids, userId];
    const isGroup = user_ids.length > 1;

    const conversation = await Conversation.create({ is_group: isGroup, name, creator_id: userId });

    await Participant.bulkCreate(
      allUserIds.map(uid => ({
        conversation_id: conversation.id,
        user_id: uid,
      }))
    );

    const newConv = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'is_online', 'last_seen'],
          through: { attributes: [] }, // untuk participant
        },
        {
          model: User,
          as: 'creator', // relasi ke creator
          attributes: ['id', 'username'],
        },
      ],
    });

    const newConvJSON = newConv.toJSON();
    newConvJSON.lastMessage = null;
    newConvJSON.lastMessageDate = new Date().toISOString();

    allUserIds.forEach(uid => {
    const sockets = getUserSockets(uid);
    const personalizedConv = {
        ...newConvJSON,
        unreadCount: uid === userId ? 0 : 1, // jika bukan pembuat, tandai 1 pesan belum dibaca
    };

    console.log(`📤 Emitting newConversation to user ${uid}. Sockets:`, sockets);


if (sockets) {
    sockets.forEach(sid => {
      io.to(sid).emit('newConversation', personalizedConv);
      console.log(`📨 Sent newConversation to socket ${sid}`);
    });
  } else {
    console.log(`⚠️ No active socket for user ${uid}`);
  }
});

  } catch (err) {
    console.error('❌ Error creating conversation:', err.message);
    socket.emit('errorMessage', 'Gagal membuat percakapan.');
  }
}

module.exports = {
  handleCreateConversation,
};
