const passport = require("passport");
const { User } = require("../schema");
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config();

passport.serializeUser(function (user, done) {
  const cookie = {
    email: user.email,
    userID: user.userID,
  };
  done(null, cookie);
});

passport.deserializeUser(function (user, done) {
  const cookie = {
    email: user.email,
    userID: user.userID,
  };
  done(null, cookie);
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      const user = await User.findOne({
        where: {
          email: email,
          status: "active",
        },
      });

      if (!user) return done(undefined);

      const passwordMatch = user.validPassword(password);

      if (passwordMatch != true) {
        return done(undefined);
      }

      return done(null, user);
    }
  )
);
