const { pub } = require("../mqtt/index");
const debug = require("../utils/debug")("mqtt");
module.exports = {
  telemetry: function (req, res) {
    debug(req.body);
    pub(`up/telemetry/${req.body.gatewayId}`, JSON.stringify(req.body));
  },
};
