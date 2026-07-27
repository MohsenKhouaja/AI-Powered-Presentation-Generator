# P2M Operations Resources

## Knowledge

- [Course: “19. Graceful Shutdown” — Sriniously](https://www.youtube.com/watch?v=6rfBgphiCWM)
  The learner's starting resource for process lifecycle, SIGINT/SIGTERM/SIGKILL, connection draining, cleanup, and bounded shutdown.
- [Node.js process signal events](https://nodejs.org/api/process.html#signal-events)
  Primary runtime contract for receiving SIGINT and SIGTERM, including the removal of Node's default exit behavior after a listener is installed.
- [Node.js event loop](https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick)
  Primary mental model for callback ordering, close callbacks, and the handles that determine whether a Node process remains alive.
- [Node.js child processes](https://nodejs.org/api/child_process.html)
  Primary contract for parent/child process ownership, signal delivery, exit versus close events, IPC, and supervisor behavior.
- [Node.js HTTP server close APIs](https://nodejs.org/api/http.html#serverclosecallback)
  Primary contract for stopping new connections while allowing active requests to finish, plus force-closing connections after a deadline.
- [MongoDB Node driver: closing connection pools](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/connection-pools/#closing-connections)
  Defines what `MongoClient.close()` does to idle and in-use sockets, sessions, transactions, and cursors.
- [MySQL2 connection pools](https://sidorares.github.io/node-mysql2/docs#using-connection-pools)
  Primary client documentation for pool ownership and the pool-ending operation required during shutdown.
- [Pino logger API: flushing](https://github.com/pinojs/pino/blob/main/docs/api.md#flush)
  Defines how buffered destinations are flushed and why shutdown must wait for the callback when delivery matters.
- [Pino transports](https://github.com/pinojs/pino/blob/main/docs/transports.md)
  Primary documentation for worker-thread transport lifecycle; especially relevant because P2M's Loki transport batches asynchronously.

- [Grafana Loki overview](https://grafana.com/docs/loki/latest/get-started/overview/)
  Primary mental model for the agent → Loki → Grafana stack, log streams, and labels.
- [Install Loki with Docker](https://grafana.com/docs/loki/latest/setup/install/docker/)
  Official, versioned local installation and readiness checks. Use for the first Loki container.
- [Loki deployment modes](https://grafana.com/docs/loki/latest/get-started/deployment-modes/)
  Explains why this course starts with monolithic mode rather than a distributed deployment.
- [Loki architecture](https://grafana.com/docs/loki/latest/get-started/architecture/)
  Use later to understand Loki's write path, read path, index, and chunks.
- [Loki HTTP API](https://grafana.com/docs/loki/latest/reference/loki-http-api/)
  Defines the native push and query contracts. Use for a controlled learning exercise, not as a reason to build an application-specific shipping client.
- [Pino transports](https://github.com/pinojs/pino/blob/main/docs/transports.md)
  Primary documentation for worker-thread transports and their startup, shutdown, and multi-target behavior.
- [pino-loki](https://github.com/Julien-R44/pino-loki)
  Pino-specific direct transport, including batching and its documented data-loss limitations. Use when comparing direct application shipping with a separate collector.
- [Send logs with Grafana Alloy](https://grafana.com/docs/loki/latest/send-data/alloy/)
  Grafana's recommended collector and the source for its collect, transform, and write responsibilities.
- [Docker Compose services reference](https://docs.docker.com/reference/compose-file/services/)
  Authoritative definitions for images, ports, volumes, health checks, and Compose services.
- [Docker Compose quickstart](https://docs.docker.com/compose/gettingstarted/)
  Gentle official introduction to the Compose lifecycle and commands.
- [Provision Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/)
  Defines the repository-managed data source files Grafana reads at startup.
- [Configure the Loki data source](https://grafana.com/docs/grafana/latest/datasources/loki/)
  Official fields and provisioning example for connecting Grafana to Loki.
- [Visualize Loki logs in Grafana](https://grafana.com/docs/loki/latest/visualize/grafana/)
  Explains Explore, LogQL queries, and the Docker service-name URL.

## Wisdom (Communities)

- [Grafana Labs Community Forums](https://community.grafana.com/)
  Use for real-world Loki configuration and troubleshooting questions after the local pipeline works.
