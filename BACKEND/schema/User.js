const { DataTypes, Model, Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");

class User extends Model {
  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
  createPassword(password) {
    const salt = bcrypt.genSaltSync();
    this.password = bcrypt.hashSync(password, salt);
    this.save();
  }
}

module.exports = function (sequelize) {
  return User.init(
    {
      userID: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING(35),
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM,
        values: ["active", "suspended", "deleted"],
        defaultValue: "active",
        allowNull: false,
      },

      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      pfp: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      permission: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      timestamps: false,
    }
  );
};
