const { Conversation, Participant, User, Message, UnreadMessage } = require('../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../models'); 

exports.createConversation = async (req, res) => {
  const { participantIds, is_group = false, name = null } = req.body;
  const userId = req.user.id;

  try {
    // Buat conversation
    const conversation = await Conversation.create({ is_group, name });

    // Tambahkan peserta (termasuk user pembuat)
    const allParticipants = [...new Set([...participantIds, userId])];
    const participantEntries = allParticipants.map((uid) => ({
      user_id: uid,
      conversation_id: conversation.id,
    }));
    await Participant.bulkCreate(participantEntries);

    res.status(201).json({ message: 'Conversation created', data: conversation });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Cari ID percakapan yang diikuti user ini
    const participantRows = await Participant.findAll({
      where: { user_id: userId },
      attributes: ['conversation_id'],
    });

    const conversationIds = participantRows.map(p => p.conversation_id);

    // 2. Ambil semua conversation beserta semua Users-nya
    const conversations = await Conversation.findAll({
      where: { id: conversationIds },
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          through: { attributes: [] },
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ message: 'Conversations retrieved', data: conversations });
  } catch (err) {
    console.error('❌ getUserConversations error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getParticipants = async (req, res) => {
  const { id } = req.params;

  try {
    const participants = await Participant.findAll({
      where: { conversation_id: id },
      include: {
        model: User,
        attributes: ['id', 'username'],
      },
    });

    const result = participants.map(p => p.User);
    res.json({ message: 'Participants retrieved', data: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.renameConversation = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const conversation = await Conversation.findByPk(id);

    if (!conversation || !conversation.is_group) {
      return res.status(400).json({ message: 'Only group conversations can be renamed' });
    }

    conversation.name = name;
    await conversation.save();

    res.json({ message: 'Conversation renamed', data: conversation });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.leaveConversation = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const participant = await Participant.findOne({
      where: {
        conversation_id: id,
        user_id: userId,
      },
    });

    if (!participant) {
      return res.status(404).json({ message: 'You are not in this conversation' });
    }

    await participant.destroy();

    res.json({ message: 'You have left the conversation' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserConversationsWithLastMessage = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Ambil semua conversation yang diikuti user ini
    const participantRows = await Participant.findAll({
      where: { user_id: userId },
      attributes: ['conversation_id'],
    });
    const conversationIds = participantRows.map(p => p.conversation_id);

    // 2. Ambil semua conversation + users
    const conversations = await Conversation.findAll({
      where: { id: conversationIds },
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          through: { attributes: [] },
        },
      ],
    });

    // 3. Untuk masing-masing conversation, ambil pesan terakhir
    const withLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({
          where: { conversation_id: conv.id },
          order: [['created_at', 'DESC']],
          include: [{ model: User, attributes: ['id', 'username'], as: 'sender' }],
        });

        const unreadCount = await UnreadMessage.count({
          where: {
            user_id: userId,
            message_id: {
              [Op.in]: sequelize.literal(`(
                SELECT id FROM t_messages WHERE conversation_id = ${conv.id}
              )`)
            }
          }
        });

        return {
          ...conv.toJSON(),
          lastMessage,
          lastMessageDate: lastMessage?.created_at || conv.createdAt,
          unreadCount,
        };
      })
    );

    // 4. Urutkan berdasarkan lastMessageDate
    const sorted = withLastMessage.sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));

    res.json({ message: 'Sorted conversations with last message', data: sorted });
  } catch (err) {
    console.error('❌ getUserConversationsWithLastMessage:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



