'use strict';
module.exports = (sequelize, DataTypes) => {
  const clothing = sequelize.define('clothing', {
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    colors: DataTypes.STRING,
    style: DataTypes.STRING,
    season: DataTypes.STRING,
    image: DataTypes.STRING
  }, {});
  clothing.associate = function(models) {
    // associations can be defined here
    clothing.belongsTo(models.user, {foreignKey: 'user_id'})
    clothing.belongsToMany(models.outfit, {through: 'clothingOutfit', foreignKey: 'clothing_id'})
  };
  return clothing;
};