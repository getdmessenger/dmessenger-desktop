/**
File: swarm/replicateRoomFeedv2.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This does the same thing as 'swarm/replicateRoomFeedv1.js', the only difference being that it handles replication via a dHub-based swarm networking instance, rather than the separate dSwarm module. This means that the replication is handled persistently, even when dMessenger or dHub is restarted. replicateRoomFeedv1.js, would not work across restarts, although replication could be reproduced for all rooms, by running this function 'forEach' room a user is apart of, since these rooms are stored in the localDb (data/getLocalDb.js) anyway. 

Note: We will ultimately use whichever version is better when it comes to performance. V2 will probably work best, since everything is managed through dHub. Testing will ultimately tell the story.
*/

import pump from 'pump'
import { getClient } from './../dhub/index.js'
import { getDb } from './../data/getDb'
import { swarmOpts } from './../opts/swarmOpts'
import { deriveKey } from './../utilities/deriveKey'

export default async function replicateRoomFeed (roomName) {
  let client = getClient()
  let db = await getDb(roomName)
  let key = deriveKey(roomName)
 
  let swarm = client.network
  await client.ready()

  await swarm.configure(key, swarmOpts)

  swarm.on('peer-add', peer => {
    pump(peer, db.replicate(true, { live: true }), peer)
  })
}