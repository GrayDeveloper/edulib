//Imports
const { Router } = require("express");
const { User } = require("../schema");

//Router
const router = Router();

router.use((req, res, next) => {
  if (req.user?.email) {
    User.findOne({
      where: {
        email: req.user?.email,
      },
    }).then((user) => {
      if (user?.permission > 1) {
        next();
      } else {
        res.status(403).send({ status: "Forbidden" });
      }
    });
  } else {
    res.status(401).send({ status: "Unauthorized" });
  }
});

module.exports = router;
