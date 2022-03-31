let clients;
(function getMqtt() {
  const debug = require("../utils/debug")("mqtt");
  const axios = require("axios");
  const MQTT = require("../mqtt/mqtt");
  axios
    .get("http://127.0.0.1:33333/as-mqtt/getAll")
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
})();
module.exports = {
  telemetry: function (req, res) {
    const { id, package } = req.body;
    const client = clients.find((e) => e.isInclude(id));
    client.pub("up/telemetry/" + package.gatewayId, JSON.stringify(package));
    res.sendStatus(200);
  },
};
