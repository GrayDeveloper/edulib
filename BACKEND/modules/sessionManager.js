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
      secret: "t^7v_evgrhmrcr_(hbm%gw*lb0%pqk1=t+oyjc(yye39qel^y",
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

  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
};

module.exports = sessionManager;
