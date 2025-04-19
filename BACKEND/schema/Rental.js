const { DataTypes, Model, Sequelize } = require("sequelize");

class Rental extends Model {}

module.exports = function (sequelize) {
  return Rental.init(
    {
      rentalID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userID: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      inventoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      rentalStart: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      rentalEnd: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM,
        values: ["active", "ended", "missing", "late", "pickup"],
        defaultValue: "pickup",
      },
    },

    {
      sequelize,
      modelName: "Rental",
      timestamps: false,
    }
  );
};
