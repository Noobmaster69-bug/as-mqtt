const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://test.mosquitto.org')
const debug = require("../utils/debug")("mqtt")
client.on('connect', () =>{
    debug("Connected to broker")
})
const workers ={}
client.on("message", (topic, message) =>{
    workers[topic](message)
})
module.exports = {
    sub: function(topic, worker,option){
        client.subscribe(topic,option,(err)=> {
            if(!err){
                debug("subcribed to " + topic + " topic")
                workers[topic] = worker
            }else{
                debug(err.message)
            }
        })
    },
    unsub: function(topic,option){
        client.unsubscribe(topic,option,(err)=>{
            if(!err){
                debug("unsubcribed to " + topic + " topic")
                delete workers[topic]
                console.log(workers)
            }else{
                debug(err.message)
            }
        })
    },
    pub: function(topic,message,option){
        client.publish(topic,message,option,(err) =>{
            if(!err){
            }else{
                debug(err.message)
            }
    })
    }
}