const { sequelize } = require("../schema");
const { User, Genre, Author, Book, Inventory } = require("../schema");
const { default: convert } = require("url-slug");

const logger = require("./logManager");

sequelize
  .authenticate()
  .then(() => logger.log("db", "Database connection established."))
  .catch((error) => logger.log("error", `Database connection error: ${error}`));

sequelize
  .sync({
    force: process.env.SERVER_DEV_MODE ? process.env.SERVER_DEV_MODE : false,
    alter: true,
  })
  .then(() => {
    if (process.env.SERVER_DEV_MODE) {
      logger.log(
        "db",
        "Database synchronized in development mode. All data has been wiped!"
      );
    } else {
      logger.log("db", "Database synchronized in production mode.");

      User.count().then((count) => {
        if (count === 0) {
          logger.log("user", `No users found. Creating admin user...`);
          User.create({
            email: process.env.ADMIN_EMAIL,
            password: "x",
            permission: 10,
            name: process.env.ADMIN_NAME,
          })
            .then((u) => {
              const password = [...crypto.getRandomValues(new Uint8Array(16))]
                .map((b) => b.toString(36))
                .join("")
                .slice(0, 16);
              u.createPassword(password);
              logger.log(
                "user",
                `Admin user created with email: ${process.env.ADMIN_EMAIL}, and password: ${password}`
              );
            })
            .catch((error) =>
              logger.log("error", `Error creating admin user: ${error}`)
            );

          console.log(process.env.APP_DEMO);
          if (process.env.APP_DEMO) {
            loadExampleData();
          }
        }
      });
    }
  })
  .catch((error) =>
    logger.log("error", `Database synchronization error: ${error}`)
  );

const loadExampleData = async () => {
  Genre.bulkCreate(require("../example/genres.json")).then(() =>
    logger.log("db", `Default genres loaded.`)
  );

  Author.bulkCreate(require("../example/authors.json")).then(() =>
    logger.log("db", `Default authors loaded.`)
  );

  const books = require("../example/books.json");
  books?.map(async (b) => {
    await Book.create({
      title: b.title,
      description: b.description,
      releaseDate: b.releaseDate,
      authorID: b.authorID,
      genreID: b.genreID,
      slug: convert(b.title),
    }).then((book) => {
      const stock = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < stock; i++) {
        Inventory.create({
          bookID: book.bookID,
          intake: new Date(),
          size: "medium",
          status: "available",
        });
      }
      logger.log("db", `Book ${book.title} added ${stock} dummy stock.`);
    });
  });

  logger.log("db", `Default books loaded.`);

  logger.log("db", `Example inventory loaded.`);

  logger.log("db", `Example data loaded.`);
};
