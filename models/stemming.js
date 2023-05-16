'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class stemming extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  stemming.init({
    kata_imbuhan: DataTypes.STRING,
    kata_dasar: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'stemming',
  });
  return stemming;
};