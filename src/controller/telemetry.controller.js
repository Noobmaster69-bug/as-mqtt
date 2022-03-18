const debug = require("../utils/debug")("mqtt");
const axios = require("axios");
const MQTT = require("../mqtt/mqtt");
let clients;
function getMqtt() {
  axios
    .get("http://127.0.0.1:33335/as-mqtt/getAll")
    .then(({ data }) => {
      clients = data.map(
        ({ host, port, protocol, ids, ...option }) =>
          new MQTT(host, port, protocol, ids, option)
      );
    })
    .catch((err) => {
      if (err.code === "ECONNREFUSED") {
        setTimeout(() => getMqtt(), 5000);
      } else {
        debug(err.message);
      }
    });
}
getMqtt();
module.exports = {
  telemetry: function (req, res) {
    const { id, package } = req.body;
    const client = clients.find((e) => e.isInclude(id));
    console.log("up/telemetry/" + package.gatewayId);
    client.pub("up/telemetry/" + package.gatewayId, JSON.stringify(package));
    res.sendStatus(200);
  },
};
