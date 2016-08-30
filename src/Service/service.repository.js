let http = require('http')
let HTTP = require('../Transport/Transport').HTTP
let CONSTANTS = require('../Config/Constants')
let GenericMiddlewareHandler = require('./../Middleware/generic.middleware.handler')
let _CONFIGURATIONS = require('./../Config/config.global')
const XResponse = require('../Transport/XResponse')
const logger = require('./../Log/Logger')
const Util = require('./../Util/Util')
let machineReport = require('./../Util/machine.reporter')

class ServiceRepository {
  /**
   * Create a service repository object
   * Transport client and server will be composed by ServiceRepository
   */

  constructor () {
    this.transportServer = new HTTP.Server()
    this.transportClient = new HTTP.Client()

    this.callDispatchMiddlewareStack = new GenericMiddlewareHandler()
    this.callDispatchMiddlewareStack.register(0, require('./Middlewares/call.middleware.first.find'))

    this.services = {}
    this.foreignServices = {}

    this.transportServer.on(CONSTANTS.events.REQUEST, (rcvPacket, response) => {
      for (var serviceName in this.services) {
        if (serviceName === rcvPacket.serviceName) {
          logger.debug(`ServiceRepository matched service ${serviceName}`)
          this.services[serviceName].fn(rcvPacket.userPayload, new XResponse(response))
          return
        }
      }
      // this will be barely reached . most of the time callDisplatchfind middleware will find this.
      // Same problem as explained in TEST/Transport.middleware => early response
      response.writeHead(404, {})
      response.end(JSON.stringify({userPayload: http.STATUS_CODES[404]}))
    })

    this.transportServer.on(CONSTANTS.events.PING, (body, response) => {
      response.end(JSON.stringify(Object.keys(this.services)))
    })

    this.ping()
    setInterval(() => this.ping(), (CONSTANTS.intervals.ping + Util.Random(CONSTANTS.intervals.threshold)))
  }

  register (name, fn) {
    this.services[name] = { fn: fn }
  }

  call (serviceName, userPayload, responseCallback) {
    this.callDispatchMiddlewareStack.apply([serviceName, userPayload, this.foreignServices, this.transportClient, responseCallback], 0)
  }

  emit (eventName, userPayload, responseCallback) {
    let nodes = _CONFIGURATIONS.getSystemConf().microservices
    for (let node of nodes) {
      this.transportClient.send(eventName, `${node.host}:${node.port}`, userPayload, responseCallback)
    }
  }

  ping () {
    let nodes = _CONFIGURATIONS.getSystemConf().microservices
    for (let node of nodes) {
      this.transportClient.ping(node, (body , res) => {
        if (res.statusCode === 200) {
          this.foreignServices[`${node.host}:${node.port}`] = body
          logger.debug(`PING success :: foreignServices = ${JSON.stringify(this.foreignServices)}`)
        } else {
          delete this.foreignServices[`${node.host}:${node.port}`]
          logger.error(`Ping Error :: ${JSON.stringify(err)}`)
        }
      })
    }
  }

  getTransportLayer () {
    return {
      Server: this.transportServer,
      Client: this.transportClient
    }
  }

  terminate () {
    this.transportServer.close()
  }
}

module.exports = ServiceRepository
