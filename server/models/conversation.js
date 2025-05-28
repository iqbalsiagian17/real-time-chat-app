module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    is_group: { type: DataTypes.BOOLEAN, defaultValue: false },
    name: { type: DataTypes.STRING }
  }, {
    tableName: 't_conversations',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Conversation;
};
