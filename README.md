
## Node XYZ

Node XYZ is a NodeJS toolkit for creating microservice based distributed applications. The main aim of XYZ is to cover following aspects of microservice architecture:

  - **Service discovery and Communication**:
    XYZ provides an easy *Path based* identification for services that each host is exposing. This ensures flexible messaging infrastructure. Consequently, XYZ systems are ***Soft*** and can act as you wish when it comes to accepting new hosts to the system.

  - **Deployment and Development**:
    XYZ provides a handy command line interface, using which you can easily test your microservices locally, deploy them and monitor them.

  - **Infinite Scalability: Configurations** are the last key component to ensure that *XYZ will commensurate with whatever requirements your system might have*. That is to say, XYZ will not enforce any application dependent configuration, instead, it will provide only a default behavior (as a fallback) for it and enables you to easily override this default behavior.

[![XYZ introduction demo](https://img.youtube.com/vi/tFBvnUHnmAk/0.jpg)](https://www.youtube.com/watch?v=tFBvnUHnmAk)

## Getting Started with Node XYZ

- [Website](https://node-xyz.github.io)
- [Getting Started](https://node-xyz.github.io/documentations)
- [API Doc](https://node-xyz.github.io/apidoc) [in progress]
- [Wiki](https://github.com/node-xyz/xyz-core/wiki)

## MVP Feature List

- MVP features (until Jan. 2017)
  - [x] Basic message communication over HTTP
  - [x] Basic cli for creating / debugging a project
  - [ ] Implementing Node configuration methods
    - [ ] Static JSON file for node setting
    - [ ] dynamic change of JSON file
  - [x] Path based address for **services**
    - Means that we can have services in node listening in paths (`service@ip:port/math/add` for example)
    - [x] Path matching and creation class
    - [x] run-time configurable service call strategy
      - Means that a foreign node should be able to send a message according to path (`service@ip:port/math/add`), and decide how is the message going to be delivered. As an example, one should be able to call all/one/a subset of services in `/math`, and decide to wait/not wait for one/all of their response(s).
  - [ ] Service Discovery
    - [x] Basic service discovery with sent-to-all ping according to static JSON file  
    - [x] Add a node on the fly. This is highly coherent with JSON configuration, since a node will initially read it's configuration
      - [x] Event for node leaving the event + configuration for it
      - [x] Permission for nodes to accept and admit new nodes
        - Followed by sending cluster events to other nodes, informing them that a new node has been joined and they have to update their configurations.

  - [ ] [Command line interface](https://github.com/node-xyz/xyz-cli)
    - [ ] Used locally to create and debug nodes
    - [ ] Run all services in the current directory without any port/seed hassle.

- Advance features
  - [ ] TCP transport layer with the same API
  - [ ] Default SSL/TLS authentication between nodes
  - [ ] Advanced examples and plugins
    - The big picture goal is that these example plugins should be adaptable to 3rd party developers and their needs
    - [ ] Load Balancer node
      - A node can be configured to have to communication with the outer worlds, instead have another local Load balancer node running alongside it, which accepts requests, stores them in a message queue and the hidden node will process them.
    - [ ] Authentication plugins

  - [ ] Advance Monitoring
    - [ ] Monitor node traffic and status
    - [ ] Communicate XYZ runtime
      - XYZ runtime is a UNIX shell application which can be installed on a new user on foreign hosts. It can:
        - [ ] Accepts commands such as start/stop/restart via ssh
        - [ ] Deploy new instances of an existing node (X-scaling)   
