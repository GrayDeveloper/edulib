const { DataTypes, Model, Sequelize } = require("sequelize");

class Genre extends Model {}

module.exports = function (sequelize) {
  return Genre.init(
    {
      genreID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },

    {
      sequelize,
      modelName: "Genre",
      timestamps: false,
    }
  );
};
