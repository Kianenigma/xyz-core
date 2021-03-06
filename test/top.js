describe('xyz-core layer', function () {
  describe('basic', function () {
    require('./tests/core.basic')
  })

  describe('data types', function () {
    require('./tests/core.dataTypes')
  })

  describe('inspection', function () {
    require('./tests/core.inspect')
  })

  describe('bootstraps', function () {
    require('./tests/core.bootstraps')
  })
})

describe('service layer', function () {
  describe('middlewares', function () {
    require('./tests/service.middlewares')
  })

  describe('path Handling', function () {
    require('./tests/service.path')
  })

  describe('serviceRepository events', function () {
    require('./tests/service.events')
  })

  describe('ping', function () {
    require('./tests/service.ping.types')
  })

  describe('service discovery with default ping', function () {
    require('./tests/service.cluster')
  })
})

describe('Transport layer', function () {
  describe('additional transport layers', function () {
    require('./tests/transport.udp.message')
  })
  describe('transport.middlewares', function () {
    require('./tests/transport.middlewares')
  })

  describe('routing', function () {
    require('./tests/transport.routes')
  })

  describe('transport.server', function () {
    require('./tests/transport.servers')
  })
})
