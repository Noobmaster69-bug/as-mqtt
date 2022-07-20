const EventEmitter = require("events");

/**
 *
 */
class MQTTClient extends EventEmitter {
  option = {};
  #client;

  /**
   *
   * @param {object} option
   */
  constructor(option) {
    super();
    const mqtt = require("./library");
    const NeDBStore = require("mqtt-nedb-store");

    const { id, host, protocol = "mqtt", ...others } = option;

    //store option
    this.option = option;

    //create mqtt connection
    let client;
    if (id) {
      //if id exist, connect to broker with local store

      //create store with path is client id, this id must be unique
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

    //store client
    this.#client = client;

    // when a message arrived
    client.on("message", (topic, message) => {
      const mqttWildcard = require("mqtt-wildcard");

      //list current event names
      const events = this.eventNames();

      let isMatched = false;

      // trigger all listeners of topic which are matched with current topic
      for (const event of events) {
        //check mqtt wildcard, if match, matcher will be an array
        const matcher = mqttWildcard(topic, event);

        if (Array.isArray(matcher)) {
          this.emit(topic, message);
          isMatched = true;
        }
      }

      //unsubcribe if topic dont have listener
      if (!isMatched) {
        this.unsub(topic);
      }
    });
  }

  /**
   *
   * @param {string | string[]} topic
   * @param {string | buffer} message
   * @returns
   */
  async pub(topic, message) {
    return await new Promise(async (reslove, reject) => {
      this.#client.publish(topic, message, { qos: 2 }, (err) => {
        if (err) {
          reject(err);
        } else {
          reslove();
        }
      });
    });
  }

  /**
   *
   * @param {string | string[]} topic
   * @param {function(message)} listener call back function which will trigger when message of the topic arrive
   * @returns
   */
  async sub(topic, listener) {
    return await new Promise((resolve, reject) => {
      this.#client.subscribe(topic, {}, (err, granted) => {
        if (err) {
          reject(err);
        } else {
          this.on(topic, listener);
          resolve();
        }
      });
    });
  }

  /**
   *
   * @param {string | string[]} topic
   * @param {function(message)} listener
   * @returns
   */
  async subOnce(topic, listener) {
    return await new Promise((resolve, reject) => {
      this.#client.subscribe(topic, {}, (err, granted) => {
        if (err) {
          reject(err);
        } else {
          this.once(topic, listener);
          resolve();
        }
      });
    });
  }
  /**
   *
   * @param {string | string[]} upTopic
   * @param {string | string[]} downTopic
   * @param {string | Buffer} message
   * @param {number} timeOut
   */
  async pubSync(upTopic, downTopic, message, timeOut = 5000) {
    return await new Promise(async (resolve, reject) => {
      let timer = setTimeout(() => {
        reject("Timeout");
      }, timeOut);
      await this.subOnce(downTopic, (message) => {
        clearTimeout(timer);
        resolve(message);
      });
      await this.pub(upTopic, message);
    });
  }

  /**
   *
   * @param {string | string[]} topic
   * @returns
   */
  async unsub(topic) {
    return await new Promise((resolve, reject) => {
      this.#client.unsubscribe(topic, (err) => {
        if (err) {
          reject(err);
        } else {
          this.removeAllListeners(topic);
          resolve();
        }
      });
    });
  }
}

class MQTT {
  /**
   * clients: [MQTTClient]
   */
  #clients = [];

  /**
   * publish to broker
   * @param {object} option see client option above
   * @param {string} topic
   * @param {string} message
   */
  async publish(option, topic, message) {
    let client = this.#queryClient(option);
    if (client === undefined) {
      client = await this.#newClient(option);
    }
    return await client.pub(topic, message);
  }

  async subscribe(option, topic, listener) {
    let client = this.#queryClient(option);
    if (client === undefined) {
      client = await this.#newClient(option);
    }
    client.sub(topic, listener);
  }
  async unsubscribe(option, topic) {
    let client = this.#queryClient(option);
    if (client === undefined) {
      client = await this.#newClient(option);
    }
    try {
      await client.unsub(topic);
    } catch (err) {
      throw err;
    }
  }
  async pubSync(option, upTopic, downTopic, message, timeOut = 5000) {
    let client = this.#queryClient(option);
    if (client === undefined) {
      client = await this.#newClient(option);
    }
    try {
      return await client.pubSync(upTopic, downTopic, message, timeOut);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * find client which being managed
   * @param {object} option
   * @returns {client}
   */
  #queryClient(option) {
    const _ = require("lodash");
    const client = this.#clients.findIndex((cl) =>
      _.isEqual(option, cl.option)
    );
    return this.#clients[client];
  }
  /**
   * create new client
   * @param {object} option
   * @returns
   */
  async #newClient(option) {
    const client = new MQTTClient(option);
    this.#clients.push(client);
    return client;
  }
}
module.exports = new MQTT();
