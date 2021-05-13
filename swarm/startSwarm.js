/**
File: swarm/startSwarm.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that creates a swarm by discoveryKey, for room, identity and local databases. This handles the replication of incoming and outgoing data, for various databases across the application. KISS.
*/
import pump from 'pump'
import dswarm from 'dswarm'

export default await function startSwarm (db, dk) {
  let swarm = dswarm()
  let didConnect = false
  swarm.join(dk, {
    lookup: true,
    announce: true
  })
  swarm.on('connection', async (socket, details) => {
    if (didConnect) return
    didConnect = true
    let stream = await db.replicate(details.client, {
      stream: socket,
      live: true
    })
    pump(socket, stream, socket)
  })
}