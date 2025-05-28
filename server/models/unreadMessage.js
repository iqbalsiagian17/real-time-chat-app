module.exports = (sequelize, DataTypes) => {
  const UnreadMessage = sequelize.define('UnreadMessage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    message_id: { type: DataTypes.INTEGER },
  }, {
    tableName: 't_unread_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return UnreadMessage;
};
