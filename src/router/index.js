module.exports = function (app) {
  app.use("/provision", require("./telemetry.router")());
};
