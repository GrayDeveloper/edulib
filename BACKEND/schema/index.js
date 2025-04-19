const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB ? process.env.DB : "mysql://root@127.0.0.1:3306/edulib",
  {
    logging: false,
    sync: true,
  }
);

const Author = require("./Author")(sequelize);
const Book = require("./Book")(sequelize);
const Genre = require("./Genre")(sequelize);
const Inventory = require("./Inventory")(sequelize);
const Rental = require("./Rental")(sequelize);
const User = require("./User")(sequelize);

Author.hasMany(Book, { foreignKey: "authorID", onDelete: "CASCADE" });
Book.belongsTo(Author, { foreignKey: "authorID" });

Book.hasMany(Inventory, { foreignKey: "bookID", onDelete: "CASCADE" });
Inventory.belongsTo(Book, { foreignKey: "bookID" });

Inventory.hasMany(Rental, { foreignKey: "inventoryID", onDelete: "CASCADE" });
Rental.belongsTo(Inventory, { foreignKey: "inventoryID" });

User.hasMany(Rental, { foreignKey: "userID", onDelete: "CASCADE" });
Rental.belongsTo(User, { foreignKey: "userID" });

Book.belongsTo(Genre, { foreignKey: "genreID" });
Genre.hasMany(Book, { foreignKey: "genreID" });

module.exports = {
  sequelize,
  Author,
  Book,
  Genre,
  Inventory,
  Rental,
  User,
};
