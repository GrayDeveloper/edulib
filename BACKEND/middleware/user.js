//Imports
const { Router } = require("express");

//Router
const router = Router();

router.use((req, res, next) => {
  if (req?.user?.email) {
    next();
  } else {
    res.status(401).send({ status: "Unauthorized" });
  }

  return req.user;
});

module.exports = router;
