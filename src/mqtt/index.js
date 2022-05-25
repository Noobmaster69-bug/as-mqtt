const debug = require("../utility/debug")("ds-mqtt: ").log;
const mqtt = require("mqtt");
const nedbStore = require("mqtt-nedb-store");
const manager = nedbStore("./mqttMessage/");
class MQTT {
  workers = {};
  ids = [];
  pubOption = {};
  constructor(host, port = 1883, protocol = "mqtt", ids, option = {}) {
    this.client = mqtt.connect(`${protocol}://${host}:${port}`, {
      ...option,
      incomingStore: manager.incoming,
      outgoingStore: manager.outgoing,
    });
    this.client.on("connect", () => {
      debug("Connected to broker");
    });
    this.client.on("message", (topic, message) => {
      this.workers[topic](message);
    });
    this.pubOption.qos = option.qos ? option.qos : 0;
    this.ids = ids;
  }
  sub(topic, worker, option) {
    this.client.subscribe(topic, option, (err) => {
      if (!err) {
        debug("subcribed to " + topic + " topic");
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
        debug(err.message);
      }
    });
  }
  unsub(topic, option) {
    this.client.unsubscribe(topic, option, (err) => {
      if (!err) {
        debug("unsubcribed to " + topic + " topic");
        delete this.workers[topic];
      } else {
        debug(err.message);
      }
    });
  }
  end() {
    this.client.end();
  }
  isInclude(id) {
    return this.ids.indexOf(id) >= 0 ? true : false;
  }
}

module.exports = MQTT;
