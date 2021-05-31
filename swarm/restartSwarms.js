/**
File: swarm/restartSwarms.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: When dMessenger is closed, the NetworkQueue (services/NetworkQueue.js) is closed and all swarm connections are destroyed. This means, when you restart the application, all of the previous swarms have to be reconnected to, so that all of the data (rooms/chats) that you've joined, can be replicated, synced and updated on your device. This is why all swarm configs are stored in the localDb. This way, we can run restartSwarms() when the application starts up, which retrieves these configs from the localDb (see services/LocalDb.js). These configs are passed to this function, which then restarts each swarm where it left off, where all room/chat data begins live replicating once again. restartSwarms() requires a username and type, so you would have to restartSwarms for each data type like so:

restartSwarms(jared, 'publicRoom')
restartSwarms(jared, 'identities')
restartSwarms(jared, 'privateRoom')
restartSwarms(jared, 'privateChat')
restartSwarms(jared, 'publicManifestDb')

So even though you may have missed a ton of data while your device was offline or the application was closed, that data will immediately come your way once you reboot the application, from wherever that data exists -- somewhere within the galaxy hehehe.. 

*/

import {
  getLocalDb,
  getDb,
  getIdentityDb,
  getPrivateRoomDb,
  getPrivateChatDb,
  getPublicManifestDb  } from './../data'

import { startSwarm } from './startSwarm'

export default function restartSwarms (username, type) {
  const localDb = await getLocalDb(username)
  const swarmConfigs = await localDb.listTypeSwarmConfigs(type)
  for (const config of swarmConfigs) {
    if (type === 'publicRoom')
      const db = getDb(config.roomName)
    else if (type === 'identities')
      const db = getIdentityDb(config.username)
    else if (type === 'privateRoom')
      const db = getPrivateRoomDb(config.roomName)
    else if (type === 'privateChat')
      const db = getPrivateChatDb(config.username)
    else if (type ==='publicManifestDb')
      const db = getPublicManifestDb(config.roomName)

    startSwarm(config, type, db)
  }
}