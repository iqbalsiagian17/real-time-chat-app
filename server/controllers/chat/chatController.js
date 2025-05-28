const { Message, User, Conversation, Participant, UnreadMessage } = require('../../models');

exports.sendMessage = async (req, res) => {
  const { conversation_id, content, type } = req.body;
  const sender_id = req.user.id;

  try {
    const conversation = await Conversation.findByPk(conversation_id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const message = await Message.create({
      conversation_id,
      sender_id,
      content,
      type: type || 'text',
    });

    // ✅ Tambahkan logika unread di sini juga
    const participants = await Participant.findAll({ where: { conversation_id } });

    const unreadEntries = participants
      .filter(p => p.user_id !== sender_id)
      .map(p => ({ user_id: p.user_id, message_id: message.id }));

    await UnreadMessage.bulkCreate(unreadEntries);

    res.status(201).json({ message: 'Message sent', data: message });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          as: 'sender' // ⬅️ ini penting jika kamu mendefinisikan alias di relasi model
        }
      ],
      order: [['created_at', 'ASC']],
    });

    res.json({ message: 'Messages retrieved', data: messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUnreadMessages = async (req, res) => {
  const userId = req.user.id;

  try {
    const unreadMessages = await UnreadMessage.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Message,
          required: true, // 🛑 penting agar hanya join yang valid
          include: [
            {
              model: User,
              attributes: ['id', 'username'],
            },
            {
              model: Conversation,
              attributes: ['id', 'name', 'is_group'],
            }
          ]
        }
      ],
      order: [['created_at', 'ASC']]
    });

    const result = unreadMessages
      .map(entry => entry.Message)
      .filter(msg => msg !== null);

console.log('UNREAD RAW:', unreadMessages.map(e => e.toJSON())); // ✅ log semuanya

res.json({
  message: 'Unread messages retrieved',
  data: unreadMessages.map((entry) => entry.Message),
});
  } catch (err) {
    console.error('❌ Error in getUnreadMessages:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.markMessagesAsRead = async (req, res) => {
  const userId = req.user.id;
  const { conversation_id } = req.body;

  try {
    // Ambil semua ID pesan dari conversation ini
    const messages = await Message.findAll({
      where: { conversation_id },
      attributes: ['id']
    });

    const messageIds = messages.map(m => m.id);

    // Hapus dari tabel t_unread_messages
    const deleted = await UnreadMessage.destroy({
      where: {
        user_id: userId,
        message_id: messageIds
      }
    });

    res.json({ message: 'Messages marked as read', deleted });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};