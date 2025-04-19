const { DataTypes, Model, Sequelize } = require("sequelize");

class Author extends Model {}

module.exports = function (sequelize) {
  return Author.init(
    {
      authorID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      birthDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      deathDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      photo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },

    {
      sequelize,
      modelName: "Author",
      timestamps: false,
    }
  );
};
