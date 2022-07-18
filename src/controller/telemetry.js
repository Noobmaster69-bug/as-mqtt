module.exports.post = async function (req, res) {
  try {
    const {
      data: { data, config },
    } = req.body;
    const mqtt = require("../mqtt");
    await mqtt.publish(config, "test12", JSON.stringify(data));
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};
