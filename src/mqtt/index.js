class MQTT {
  /**
   * client: {
   *  option: client connection option
   *    {
   *      id: 'client' id, id to manage client in this class, not id in client of mqtt library
   *      host: client ip address or domain name, Ex: "broker.hivemq.com"
   *      protocol: connection protocol, one of these values: ["mqtt"]
   *    }
   *  instance: mqtt client instance
   *
   * }
   */
  #clients = [];

  /**
   * publish to broker
   * @param {object} option see client option above
   * @param {string} topic
   * @param {string} message
   */
  async publish(option, topic, message) {
    return new Promise(async (resolve, reject) => {
      let client = this.#queryClient(option);
      if (client === undefined) {
        client = await this.#newClient(option);
      }
      client.instance.publish(topic, message, { qos: 0 }, (err) => {
        if (err) {
          reject(err);
        } else resolve();
      });
    });
  }

  /**
   * find client which being managed
   * @param {object} option
   * @returns {client}
   */
  #queryClient(option) {
    const _ = require("lodash");
    const client = this.#clients.find((cl) => _.isEqual(option, cl.option));
    return client;
  }
  /**
   * create new client
   * @param {object} option
   * @returns
   */
  async #newClient(option) {
    const mqtt = require("./library");
    const NeDBStore = require("mqtt-nedb-store");

    const { id, host, protocol = "mqtt", ...others } = option;
    //create mqtt connection
    let client;
    if (id) {
      //if id exist, connect to broker with local store

      //create store with path is client id, this id is unique
      const manager = NeDBStore(`./store/${id}`);

      //connect to mqtt broker with store
      client = mqtt.connect(`${protocol}://${host}`, {
        ...others,
        outgoingStore: manager.outgoing,
        incomingStore: manager.incoming,
      });
    } else {
      //if id not exist, connect to broker witout local store
      client = mqtt.connect(`${protocol}://${host}`, {
        ...others,
      });
    }
    //on connect, push connection option and client to #clients to manages clients
    client.on("connect", () => {
      console.log("connected to broker");
    });
    //on error
    client.on("offline", () => {
      console.log("offline");
    });
    client.on("end", () => {
      console.log("end");
    });
    this.#clients.push({
      option,
      instance: client,
    });
    return this.#clients[this.#clients.length - 1];
  }
}
module.exports = new MQTT();
