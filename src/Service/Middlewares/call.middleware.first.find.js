let http = require('http');
const logger = require('./../../Log/Logger');

function firstFind(params, next, done) {
  let serviceName = params[0],
    userPayload = params[1],
    foreignServices = params[2],
    transportClient = params[3]
  responseCallback = params[4];

  for (let node in foreignServices) {
    logger.silly(`FIRST FIND :: target : ${JSON.stringify(foreignServices)}`)
    let index = foreignServices[node].indexOf(serviceName);
    if (index > -1) {
      let config = { serviceName: serviceName, uri: node };
      logger.silly(`determined node by first find strategy ${node}`);
      transportClient.send(config, userPayload, responseCallback);
      return
    }
  }
  responseCallback(http.STATUS_CODES[404], null, null)
}

module.exports = firstFind;