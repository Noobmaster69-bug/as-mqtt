const telemetry = require("../controller/telemetry.controller");
module.exports = function (app) {
  app.use("/telemetry", telemetry.telemetry);
};
