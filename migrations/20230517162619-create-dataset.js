'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Datasets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tanggal: {
        type: Sequelize.DATE
      },
      data_asli: {
        type: Sequelize.STRING
      },
      data_case_folding: {
        type: Sequelize.STRING
      },
      data_remove_mention_ling: {
        type: Sequelize.STRING
      },
      data_slangword: {
        type: Sequelize.STRING
      },
      data_stemming: {
        type: Sequelize.STRING
      },
      data_stopword: {
        type: Sequelize.STRING
      },
      klasifikasi: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Datasets');
  }
};