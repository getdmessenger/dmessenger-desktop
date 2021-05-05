/**
File: swarm/replicateRoomFeedv1.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This file exports a function that attempts to connect to peers on dWeb's DHT for a specific key that is derived from a room name and replicates the a user's local feed within the room's NeutronDB with those other peers. This version of replicateRoomFeed uses the dSwarm module to accomplish this.
*/

import pump from 'pump'
import dswarm from 'dswarm'
import { getDb } from './../data/getDb'
import { swarmOpts } from './../opts/swarmOpts'
import { deriveKey } from './utilities/deriveKey'

export default function replicateRoomFeed (roomName) {
  let swarm = dswarm()
  let db = await getDb(roomName)
  let key = deriveKey(roomName)

  swarm.join(key, {
    lookup: true,
    announce: true
  })

  swarm.on('connection', (connection, info) => {
    pump(connection, db.replicate(info.client, { live: true }), connection)
  })
}