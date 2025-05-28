module.exports = (sequelize, DataTypes) => {
  const Participant = sequelize.define('Participant', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    conversation_id: { type: DataTypes.INTEGER, allowNull: false },
    joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 't_participants',
    underscored: true,
    timestamps: false
  });

  return Participant;
};
