const { createLogger, format, transports } = require("winston");
const { combine, printf } = format;

const taggedFormat = printf(info => {
  return `[${info.label}]: ${info.message.trim().replace(/\n/g, "\n        ")}`;
});

const logger = createLogger({
  level: "info",
  format: combine(taggedFormat),
  transports: [new transports.Console()]
});

module.exports = logger;
