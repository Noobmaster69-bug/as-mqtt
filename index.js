require("dotenv").config();
const { log, error } = require("./src/utility/debug")("ds-mqtt: ");
const app = require("express")();

(async function () {
  await require("./src/middleware")(app);
  await require("./src/router")(app);
  const port = process.env.PORT || 33335;
  app.listen(port, () => log("running on port " + port));
})();
