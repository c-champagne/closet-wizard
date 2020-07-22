'use strict';
module.exports = (sequelize, DataTypes) => {
  const outfit = sequelize.define('outfit', {
    name: DataTypes.STRING,
    colors: DataTypes.STRING,
    style: DataTypes.STRING,
    season: DataTypes.STRING,
    image: DataTypes.STRING,
    top: DataTypes.STRING,
    bottom: DataTypes.STRING,
    shoes: DataTypes.STRING
  }, {});
  outfit.associate = function(models) {
    // associations can be defined here
    outfit.belongsTo(models.user, {foreignKey: 'user_id'})
    outfit.belongsToMany(models.clothing, {through: 'clothingOutfit', foreignKey: 'outfit_id'})
  };
  return outfit;
};