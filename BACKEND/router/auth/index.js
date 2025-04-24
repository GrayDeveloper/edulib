//Imports
const { Router } = require("express");
const passport = require("passport");
const { User } = require("../../schema");
const yup = require("yup");
const { Op } = require("sequelize");
const logger = require("../../modules/logManager");

const router = Router();

const validateUserForm = async (req, res, next) => {
  const registerForm = yup.object().shape({
    email: yup
      .string()
      .email("Must be a valid email")
      .max(45, "Email must be at most 45 characters")
      .required("Email is required"),
    name: yup
      .string()
      .min(4, "Name must be at least 4 characters")
      .max(45, "Name must be at most 45 characters")
      .required("Name is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });
  try {
    await registerForm.validate(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

router.get("/", (req, res) => {
  return req.user
    ? res.send({ status: "Logged in" })
    : res.status(401).send({ status: "Unauthorized" });
});

router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      res.redirect(401, "/login");
    }
    if (user) {
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        logger.log("user", `User ${user?.email} logged in.`);
        return res.redirect(200, "/");
      });
    } else {
      return res.redirect(401, "/login");
    }
  })(req, res);
});

router.post("/signup", validateUserForm, async function (req, res, next) {
  const { name, email, password } = req?.body;

  const [user, created] = await User.findOrCreate({
    where: {
      email: email,
    },
    defaults: {
      name: name,
      email: email,
      password: "x",
    },
  });

  if (created) {
    user.createPassword(password);

    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      logger.user(`User ${user.email} signed up.`);
      return res.redirect(200, "/");
    });
  } else {
    return res.status(409).send({ status: "Email already in use" });
  }
});

router.post("/logout", async (req, res) => {
  req.logout(async function (err) {
    if (err) {
      return next(err);
    }
    logger.log("user", `User ${req?.user?.email} logged out.`);
    req.session.destroy(function () {
      res.clearCookie("connect.sid", { path: "/" });
      return res.redirect(200, "/");
    });
  });
});

module.exports = router;
