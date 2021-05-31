/**
File: swarm/startSwarm.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that takes a swarm configuration, a swarm type and a database instance and then announces the device on the DHT under the particular discovery key from within the swarm configuration and replicates the database instance related to it on a per-peer basis. An example of this would be announcing yourself under a public room's discovery key and for every peer connection, live replicating the public room data feed. This would ensure that you're receiving all of the latest data related to the room, and live replicating all of the data you append to the room as well, to peers who are doing the same.
*/

import dswarm from 'dswarm'
import pump from 'pump'

export default function startSwarm (swarmConfig, type, db) {
  const swarm = dswarm()
  swarm.join(swarmConfig.discoveryKey, {
    lookup: swarmConfig.lookup,
    announce: swarmConfig.announce
  })
  swarm.on('connection', (socket, info) => {
    console.log(`New ${type} connection opened with peer`)
    pump(
      socket,
      (type === 'publicRoom')
        ? db.replicate(info.client, {live: true})
        : db.replicate({live: true}),
      socket
    )
  })
}
