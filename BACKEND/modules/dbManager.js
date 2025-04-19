const { sequelize } = require("../schema");
const { User } = require("../schema");

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
          logger.log("user", `No users found. Creating admin user.`);
          User.create({
            email: process.env.ADMIN_EMAIL,
            password: "x",
            permission: 10,
            name: process.env.ADMIN_NAME,
          })
            .then((u) => {
              u.createPassword(process.env.ADMIN_PASSWORD);
              logger.log(
                "user",
                `Admin user created with email: ${process.env.ADMIN_EMAIL}`
              );
            })
            .catch((error) =>
              logger.log("error", `Error creating admin user: ${error}`)
            );
        }
      });
    }
  })
  .catch((error) =>
    logger.log("error", `Database synchronization error: ${error}`)
  );
