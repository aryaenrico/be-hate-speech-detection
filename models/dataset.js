'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Dataset extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Dataset.init({
    tanggal: DataTypes.DATE,
    data_asli: DataTypes.STRING,
    data_case_folding: DataTypes.STRING,
    data_remove_mention_ling: DataTypes.STRING,
    data_slangword: DataTypes.STRING,
    data_stemming: DataTypes.STRING,
    data_stopword: DataTypes.STRING,
    klasifikasi: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Dataset',
  });
  return Dataset;
};