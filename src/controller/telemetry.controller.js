module.exports.post = async function (req, res) {
  try {
    const {
      data: {
        data,
        config: { topic, ...config },
      },
    } = req.body;
    const mqtt = require("../mqtt");
    await mqtt.publish(config, "/up/telemetry/" + topic, JSON.stringify(data));
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};
