//Imports
const { Router } = require("express");
require("dotenv").config();

//Router
const router = Router();

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/authors", require("./authors"));
router.use("/books", require("./books"));
router.use("/library", require("./library"));
router.use("/rentals", require("./rentals"));
router.use("/genres", require("./genres"));
router.use("/inventory", require("./inventory"));
module.exports = router;
