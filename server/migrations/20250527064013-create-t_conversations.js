'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('t_conversations', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      is_group: { type: Sequelize.BOOLEAN, defaultValue: false },
      name: { type: Sequelize.STRING },
      creator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 't_users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('t_conversations');
  },
};
