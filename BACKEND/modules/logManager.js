const DailyRotateFile = require("winston-daily-rotate-file");
const winston = require("winston"),
  expressWinston = require("express-winston");

console.clear();
var fileLogger = new DailyRotateFile({
  filename: "edulib-backend-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  json: true,
  dirname: "./logs",
});

const logger = winston.createLogger({
  level: "all",

  transports: [
    fileLogger,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({
          colors: {
            info: "blue",
            warn: "yellow",
            error: "red",
            db: "cyan",
            user: "green",
            rent: "grey",
            inventory: "grey",
            cron: "red",
            all: "white",
          },
        }),
        winston.format.simple()
      ),
    }),
  ],

  levels: {
    info: 0,
    warn: 1,
    error: 2,
    db: 3,
    user: 4,
    rent: 5,
    inventory: 6,
    cron: 7,
    all: 8,
  },
});

module.exports = logger;
