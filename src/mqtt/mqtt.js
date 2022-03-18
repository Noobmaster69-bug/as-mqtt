const debug = require("../utils/debug")("mqtt");
const mqtt = require("mqtt");
const levelStore = require("mqtt-level-store");
const manager = levelStore("./mqttMessage/");
class MQTT {
  workers = {};
  debug = debug;
  ids = [];
  pubOption = {};
  constructor(host, port = 1883, protocol = "mqtt", ids, option = {}) {
    this.client = mqtt.connect(`${protocol}://${host}:${port}`, {
      ...option,
      incomingStore: manager.incoming,
      outgoingStore: manager.outgoing,
    });
    this.client.on("connect", () => {
      this.debug("Connected to broker");
    });
    this.client.on("message", (topic, message) => {
      this.workers[topic](message);
    });
    this.pubOption.QoS = option.QoS ? option.QoS : 0;
    this.ids = ids;
  }
  sub(topic, worker, option) {
    this.client.subscribe(topic, option, (err) => {
      if (!err) {
        this.debug("subcribed to " + topic + " topic");
        this.workers[topic] = worker;
      } else {
        debug(err.message);
      }
    });
  }
  pub(topic, message, option = this.pubOption) {
    this.client.publish(topic, message, option, (err) => {
      if (!err) {
      } else {
        this.debug(err.message);
      }
    });
  }
  unsub(topic, option) {
    this.client.unsubscribe(topic, option, (err) => {
      if (!err) {
        this.debug("unsubcribed to " + topic + " topic");
        delete this.workers[topic];
        console.log(workers);
      } else {
        this.debug(err.message);
      }
    });
  }
  isInclude(id) {
    return this.ids.indexOf(id) >= 0 ? true : false;
  }
}

module.exports = MQTT;
