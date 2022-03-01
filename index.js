const debug = require("./src/utils/debug")("app");
const app = require("express")();

require("./src/config/index")();
require("./src/middleware/index")(app);
require("./src/routes/index")(app);
app.listen(process.env.PORT || 10000, () =>
  debug("core is running on port " + (process.env.PORT || 10000))
);
