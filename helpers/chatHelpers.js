/**
File: helpers/chatHelpers.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports helper functions for joining/leaving private chats.
*/

import { getLocalDb } from './../data/getLocalDb'

export async function joinPrivateChat (username , opts) {
  return new Promise((resolve) => {
    const localDb = await getLocalDb(username)
    await localDb.addSwarmConfig('privateChat', {
      lookup: opts.swarm.lookup,
      announce: opts.swarm.announce,
      discoveryKey: opts.swarm.discoveryKey,
      creator: opts.creator,
      username: opts.username
    })
    await localDb.addPrivateRoom(opts.username, opts.creator)
    return resolve()
  })
}

export async function leavePrivateChat (username, key, chat) {
  return new Promise((resolve) => {
    const localDb = await getLocalDb(username)
    await localDb.removePrivateChat(chat)
    await localDb.removeSwarmConfig(key, 'privateChat')
    return resolve()
  })
}