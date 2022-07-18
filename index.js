const app = require("express")();
(async function () {
  //config middleware
  require("./src/middleware")(app);
  //config route
  require("./src/router")(app);
  //run server
  app.listen(33335, () => {
    console.log("ds-mqtt is running on port 33335");
  });
})();
// const mqtt = require("./src/mqtt");
// mqtt.publish(
//   { id: 1, host: "broker.hivemq.com", protocol: "mqtt" },
//   "test12",
//   "1"
// );
