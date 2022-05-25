const { axios } = require("axios");

let clients;
function getMqtt() {
  const debug = require("../utility/debug")("ds-mqtt: ").log;
  const axios = require("axios");
  const MQTT = require("../mqtt");
  axios
    .get("http://localhost:33333/protocol/?name=ds-mqtt")
    .then(({ data }) => {
      clients = data.map(
        ({ host, port, protocol, ProtocolID, ...option }) =>
          new MQTT(host, port, protocol, [ProtocolID], option)
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
  async post(req, res) {
    const {
      data: {
        package,
        protocol: { ProtocolID, topic },
      },
    } = req.body;
    let client = clients.find((e) => e.isInclude(ProtocolID));
    if (client === undefined) {
      getMqtt();
      client = clients.find((e) => e.isInclude(ProtocolID));
    }
    client.pub("up/telemetry/" + topic, JSON.stringify(package));
    return res.sendStatus(200);
  },
  async get(req, res) {
    const { package, ProtocolID, topic } = req.body;
    let client = clients.find((e) => e.isInclude(ProtocolID));
    if (client === undefined) {
      getMqtt();
      client = clients.find((e) => e.isInclude(ProtocolID));
    }
    client.pub("up/provision/" + topic, JSON.stringify(package));
    client.sub("down/provision/" + topic, (message) => {
      const body = JSON.parse(message);
      axios
        .post("http://localhost:33333/provision/confirm", {
          ...body,
        })
        .then(data)
        .catch((err) => console.log(err));
    });
    res.sendStatus(200);
  },
};
