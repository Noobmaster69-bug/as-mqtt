module.exports = function (app) {
  const telemetry = require("../controller/telemetry.controller");
  app.use("/telemetry", telemetry.telemetry);
};
