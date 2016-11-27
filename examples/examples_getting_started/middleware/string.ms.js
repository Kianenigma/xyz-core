let xyz = require('xyz-core').xyz
let sendToAll = require('xyz.service.send.to.all')

let stringMS = new xyz({
  defaultSendStrategy: sendToAll,
  selfConf: {
    name: 'stringMS',
    host: '127.0.0.1',
    port: 3334,
    seed: [{host: '127.0.0.1', port: 3333}]
  },
  systemConf: {
    microservices: []
  }
})

stringMS.middlewares().transport.callDispatch.register(0, require('./auth.send'))
stringMS.middlewares().transport.callReceive.register(0, require('./auth.receive'))

stringMS.register('up', (payload, response) => {
  response.send(payload.toUpperCase())
})
stringMS.register('down', (payload, response) => {
  response.send(payload.toLowerCase())
})

setInterval(() => {
  stringMS.call('/*/mul', {x: 2, y: 5}, (err, body, res) => {
    console.log(`my fellow service responded with ${JSON.stringify(body)}`)
  })
}, 2000)
