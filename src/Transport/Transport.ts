import { ITransportServerConfig } from './../Config/config.interfaces'
import { CONFIG } from './../Config/config.global'
import { GenericMiddlewareHandler } from './../Middleware/generic.middleware.handler'
import { logger } from './../Log/Logger'
import {wrapper} from './../Util/Util'
import HTTPServer from './HTTP/http.server'
import UDPServer from './UDP/udp.server'
import {
  ITransportSentMessageBody,
  ITransportSentMessageMwParam,
  ITransportSentMessageConfig,
  ITransportSendMessageParams} from './transport.interfaces'
import _httpExport from './Middlewares/http.export.middleware'
import XYZ from './../xyz'

export default class Transport {
  xyz: XYZ
  routes: Object
  servers: Object

  /**
   * Transport layer. This layer is an abstraction above all different sorts of communication.
   */
  constructor (xyz) {
    this.xyz = xyz

    this.routes = {}
    this.servers = {}

    let callDispatchMiddlewareStack = new GenericMiddlewareHandler(this.xyz, 'call.dispatch.mw', 'CALL')
    callDispatchMiddlewareStack.register(-1, _httpExport)
    this.registerRoute('CALL', callDispatchMiddlewareStack)
  }

  inspect () {
    let ret = `${wrapper('green', wrapper('bold', 'outgoing middlewares'))}:\n`
    for (let route in this.routes) {
      ret += `    ${this.routes[route].inspect()}\n`
    }
    ret += '\n'
    for (let s in this.servers) {
      ret += `  ${wrapper('bold', wrapper('magenta', this.servers[s].constructor.name + ' @ ' + s))} ::\n`
      ret += `    ${this.servers[s].inspect()}\n`
    }
    return ret
  }

  inspectJSON () {
    let ret = {'outgoingRoutes': [], servers: []}
    for (let route in this.routes) {
      ret.outgoingRoutes.push(this.routes[route].inspectJSON())
    }

    for (let s in this.servers) {
      ret.servers.push(this.servers[s].inspectJSON())
    }
    return ret
  }

  /**
   *
   * opt should have:
   *   - node {string} address of destination,
   *   - route {string} url of outgoing middleware stack
   *   - payload {object}. depending on `route` , it can have `userPayload`, `service` or `_id`
   * @param opt {Obeject} the options object.
   * @param responseCallback {Function} the callback of the message. Note that this is valid
   * only for http calls. UDP / TCP calls do not have a callback
   */
  send (opt: ITransportSendMessageParams, responseCallback?) {
    opt.route = opt.route || 'CALL'

    if (!this.routes[opt.route]) {
      logger.error(`attempting to send message in route ${opt.route}. DOES NOT EXIST`)
      responseCallback('outgoing message route not found', null)
      return
    }

    let _port
    // TODO: BUG
    // here we are assuming that a route is unique in each NODE, not server
    // it should be checked...
    if (opt.redirect) {
      _port = this._findTargetPort(opt.route, opt.node)
      if (_port === -1) {
        logger.error(`Transport Client :: could not find route ${opt.route} in destination node ${opt.node}. aborting transmission`)
        if (responseCallback) {
          responseCallback('target port/route not found', null)
        }
        return
      }
    }

    let xMessage: ITransportSentMessageBody = {
      userPayload: opt.payload,
      xyzPayload: {
        senderId: this.xyz.id().netId,
        service: opt.service
      }
    }

    let requestConfig: ITransportSentMessageConfig = {
      hostname: `${opt.node.split(':')[0]}`,
      port: _port || `${opt.node.split(':')[1]}`,
      path: `/${opt.route}`,
      method: 'POST',
      json: xMessage
    }

    // mw param
    let xMessageParam: ITransportSentMessageMwParam = {
      requestConfig: requestConfig,
      responseCallback: responseCallback
    }

    logger.debug(`${wrapper('bold', 'Transport Client')} :: sending message to ${wrapper('bold', requestConfig.hostname)}:${requestConfig.port}/${opt.route} through ${this.routes[opt.route].name} middleware :: message ${JSON.stringify(xMessage)}`)

    this.routes[opt.route].apply(xMessageParam, 0)
  }

  registerServer (type, port, e) {
    let server
    if (type === 'HTTP') {
      server = new HTTPServer(this.xyz, port)
      this.servers[Number(port)] = server
      CONFIG.addServer({type: type, port: port, event: e})
      return server
    } else if (type === 'UDP') {
      server = new UDPServer(this.xyz, port)
      this.servers[Number(port)] = server
      CONFIG.addServer({type: type, port: port, event: e})
      return server
    } else {
      logger.error(`transport server type ${type} undefined`)
      return false
    }
  }

  /**
   * Creates a new client route
   * @param {String} prefix
   * @param {Object} [gmwh] The GenericMiddlewareHandler instance to use for
   * this route. will create a new one if not provided.
   *
   */
  registerRoute (prefix, gmwh) {
    logger.info(`Transport :: new outgoing message route ${wrapper('bold', prefix)} added`)
    if (gmwh) {
      this.routes[prefix] = gmwh
    } else {
      logger.warn(`Transport :: no middlewareHandler defined for route ${prefix}. an empty one will be used`)
      this.routes[prefix] = new GenericMiddlewareHandler(this.xyz, `${prefix}.dispatch.mw`, prefix)
    }
    return 1
  }

  /**
   * Removes a client route
   */
  removeRoute (prefix) {
    if (this.routes[prefix]) {
      delete this.routes[prefix]
      logger.info(`TRANSPORT :: route ${prefix} removed.`)
      return 1
    } else {
      logger.error(`TRANSPORT :: attempting to remove route ${prefix} which does not exist.`)
      return -1
    }
  }

  getServerRoutes () {
    let ret = {}
    for (let s in this.servers) {
      ret[s] = Object.keys(this.servers[s].routes)
    }
    return ret
  }

  _findTargetPort (route, node) {
    let foreignRoutes = this.xyz.serviceRepository.foreignRoutes[node]
    for (let p in foreignRoutes) {
      for (let r of foreignRoutes[p]) {
        if (r === route) {
          return p
        }
      }
    }
    return -1
  }

  _checkUniqueRoute (prefix) {
    for (let s in this.servers) {
      for (let r in this.servers[s].routes) {
        if (r === prefix) {
          return false
        }
      }
    }
    return true
  }
}
