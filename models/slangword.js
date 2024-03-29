'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Slangword extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Slangword.init({
    tidakbaku: DataTypes.STRING,
    katabaku: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Slangword',
    tableName:"slangwords"
  });
  return Slangword;
};