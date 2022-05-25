module.exports = function (topic) {
  const debug = require("debug");
  const log = debug("app:");
  log.log = console.log.bind(console);
  const error = debug("app:");
  debug.enable("app:*");
  return { log: log.extend(topic), error: error.extend(topic) };
};
