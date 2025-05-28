'use strict';

// migrations/xxxx-create-t_unread_messages.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('t_unread_messages', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 't_users', key: 'id' },
        onDelete: 'CASCADE',
      },
      message_id: {
        type: Sequelize.INTEGER,
        references: { model: 't_messages', key: 'id' },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('t_unread_messages');
  },
};
