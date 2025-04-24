const session = require("express-session");
const SessionStore = require("express-session-sequelize")(session.Store);
const { sequelize } = require("../schema");
const passport = require("passport");
const cors = require("cors");

const sequelizeSessionStore = new SessionStore({
  db: sequelize,
});

const sessionManager = (app) => {
  app.use(
    session({
      secret: process.env.APP_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: "/",
        httpOnly: true,
        maxAge: 60000 * 60 * 24 * 7,
      },
      store: sequelizeSessionStore,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(
    cors({
      origin: [
        "http://" + process.env.APP_DOMAIN,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://frontend_server:3000",
        "http://frontend_server",
        "http://localhost",
      ],
      credentials: true,
    })
  );
};

module.exports = sessionManager;
