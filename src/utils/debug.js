const DEBUG = require("debug");
const debug = DEBUG("core");
debug.log = console.log.bind(console);
DEBUG.enable("core:*");
module.exports = function (type) {
  return debug.extend(type);
};
