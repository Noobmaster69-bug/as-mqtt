module.exports.post = async function (req, res) {
  const { topic, channels, ...option } = req.body;
  const mqtt = require("../mqtt");
  try {
    const provision = await mqtt.pubSync(
      option,
      `/up/provision/${topic}`,
      `/down/provision/${topic}`,
      JSON.stringify(channels),
      1000
    );
    res.send(provision);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
};
