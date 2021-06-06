/**
File: helpers/roomHelpers.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports helper functions, related to public and private rooms.
*/

import crypto from 'crypto'
import { verify } from '@ddatabase/crypto'
import { IdQuery } from '@dwebid/query'
import { getLocalDb } from './../data/getLocalDb'
import { getIdentityInstance } from './../identity/getIdentityInstance'

export async function addPublicRoomToId (username, opts) {
  const id = await getIdentityInstance(username, {})
  await id.addAppData({
    appName: "dmessenger",
    dataType: "publicRooms",
    data: {
      roomName: opts.roomName,
      isCreator: opts.isCreator,
      roomKey: crypto.createHash('sha256').update(roomName).digest()
    },
    keyName: roomName
  })
}

// TODO: get value of each list item
export async function listPublicRooms (username) {
  return new Promise((resolve, reject) => {
    const id = await getIdentityInstance(username)
    const db = await id.getDb()
    db.list('/apps/dmessenger/publicRooms', (err, list) => {
      if (err) return reject(err)
      return resolve(list.map(n => n.value))
    })
  })
}

export async function joinPublicRoom (username, opts) {
  return new Promise((resolve) => {
    const localDb = await getLocalDb(username)
    await addSwarmConfig('publicRoom', {
      lookup: opts.swarm.lookup,
      announce: opts.swarm.announce,
      discoveryKey: crypto.createHash('sha256').update(opts.roomName).digest(),
      roomName: opts.roomName
    })
    await addPublicRoomToId(username, opts)
    resolve()
  })
}

export async function removePublicRoomFromId (username, roomName) {
  return new Promise((resolve, reject) => {
    const id = await getIdentityInstance(username)
    const db = await id.getDb()
    db.del(`/apps/dmessenger/publicRooms/${roomName}`, (err) => {
      if (err) return reject()
      else return resolve()
    })
  })
}

export async function joinPrivateRoom (username, opts) {
  return new Promise((resolve) => {
    const localDb = await getLocalDb(username)
    await localDb.addSwarmConfig('privateRoom', {
      lookup: opts.swarm.lookup,
      announce: opts.swarm.announce,
      discoveryKey: opts.swarm.discoveryKey,
      creator: opts.creator,
      roomName: opts.roomName
    })
    await localDb.addPrivateRoom(opts.roomName, opts.isCreator)
    return resolve()
  })
}

export async function leavePrivateRoom (username, key, roomName) {
  return new Proimise((resolve) => {
    const localDb = await getLocalDb(username)
    await localDb.removeSwarmConfig(key, 'privateRoom')
    await localDb.removePrivateRoom(roomName)
    return resolve()
  })
}

export async function messageLegit (message, signature, user) {
  return new Promise((resolve) => {
    const query = new IdQuery(user)
    const key = await query.getRemoteKey('publicKey')
    return resolve(verify(message, signature, key))
  })
}