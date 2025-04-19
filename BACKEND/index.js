const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`EduLIB API ${process.env.API_VERSION}`);
});

const logger = require("./modules/logManager");
require("./modules/dbManager");
require("./modules/sessionManager")(app);
require("./modules/authManager");
require("./modules/cronManager");

app.use("/api", require("./router"));

app.listen(process.env.SERVER_PORT ? process.env.SERVER_PORT : 8080, () => {
  logger.log(
    "info",
    `EduLIB backend running on ${
      process.env.SERVER_PORT ? process.env.SERVER_PORT : 8080
    }`
  );
});
