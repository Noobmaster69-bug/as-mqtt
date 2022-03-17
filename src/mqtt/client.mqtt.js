const axios = require("axios");
const MQTT = require("./mqtt");
let clients;
axios
  .get("http://127.0.0.1:33335/as-mqtt/getAll")
  .then(({ data }) => {
    clients = data.map(
      ({ host, port, protocol, ids, ...option }) =>
        new MQTT(host, port, protocol, ids, option)
    );
  })
  .catch((err) => console.log(err));
module.exports = { clients };
