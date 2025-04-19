const { DataTypes, Model, Sequelize } = require("sequelize");

class Inventory extends Model {}

module.exports = function (sequelize) {
  return Inventory.init(
    {
      inventoryID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      bookID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      intake: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      size: {
        type: DataTypes.ENUM,
        values: ["small", "medium", "large"],
        defaultValue: "medium",
      },

      status: {
        type: DataTypes.ENUM,
        values: ["available", "rented", "missing", "damaged", "pending"],
        defaultValue: "available",
      },
    },

    {
      sequelize,
      modelName: "Inventory",
      timestamps: false,
    }
  );
};
