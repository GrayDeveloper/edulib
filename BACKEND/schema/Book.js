const { DataTypes, Model, Sequelize } = require("sequelize");

class Book extends Model {}

module.exports = function (sequelize) {
  return Book.init(
    {
      bookID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      releaseDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      cover: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      authorID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      genreID: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      ISBN: {
        type: DataTypes.STRING(13),
        allowNull: true,
      },

      slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },

    {
      sequelize,
      modelName: "Book",
      timestamps: false,
    }
  );
};
