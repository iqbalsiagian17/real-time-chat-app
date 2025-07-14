const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./user')(sequelize, DataTypes);
const Conversation = require('./conversation')(sequelize, DataTypes);
const Participant = require('./participant')(sequelize, DataTypes);
const Message = require('./message')(sequelize, DataTypes);
const UnreadMessage = require('./unreadMessage')(sequelize, DataTypes);

// RELASI
User.hasMany(Message, { foreignKey: 'sender_id' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'sender_id' }); 
Conversation.hasMany(Message, { foreignKey: 'conversation_id' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

Conversation.belongsToMany(User, {
  through: Participant,
  foreignKey: 'conversation_id'
});

Conversation.belongsTo(User, {
  as: 'creator',
  foreignKey: 'creator_id'
});

User.belongsToMany(Conversation, {
  through: Participant,
  foreignKey: 'user_id'
});

Participant.belongsTo(User, { foreignKey: 'user_id' });

UnreadMessage.belongsTo(User, { foreignKey: 'user_id' });
UnreadMessage.belongsTo(Message, {
  foreignKey: 'message_id',
  targetKey: 'id', // ⬅️ tambahkan ini agar Sequelize tau
});
Message.hasMany(UnreadMessage, { foreignKey: 'message_id' });



module.exports = {
  sequelize,
  User,
  Conversation,
  Participant,
  Message,
  UnreadMessage
};
