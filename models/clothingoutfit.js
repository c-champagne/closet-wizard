'use strict';
module.exports = (sequelize, DataTypes) => {
  const clothingOutfit = sequelize.define('clothingOutfit', {
    clothing_id: DataTypes.INTEGER,
    outfit_id: DataTypes.INTEGER
  }, {});
  clothingOutfit.associate = function(models) {
    // associations can be defined here
  };
  return clothingOutfit;
};