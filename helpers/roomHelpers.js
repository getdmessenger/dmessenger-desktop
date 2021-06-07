/**
File: helpers/roomHelpers.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Helper functions for working with public and private rooms.
*/

import crypto from 'crypto'
import { verify } from '@ddatabase/crypto'
import { IdQuery } from '@dwebid/query'
import { getLocalDb } from './../data/getLocalDb'
import { getIdentityInstance } from './../identity/getIdentityInstance'
import { isUserBlocked } from './manifestHelpers'

export async function joinPublicRoom (username, opts) {
  return new Promise((resolve, reject) => {
    const localDb = await getLocalDb(username)
    if (isUserBlocked('publicRoom', opts.roomName, username)) return reject()
    await localDb.addSwarmConfig('publicRoom', {
      lookup: opts.swarm.lookup,
      announce: opts.swarm.announce,
      discoveryKey: deriveRoomKey(opts.roomName),
      roomName: opts.roomName
    })
    await localDb.addSwarmConfig('publicManifest', {
      lookup: opts.swarm.lookup,
      announce: opts.swarm.announce,
      discoveryKey: derivePublicManifestKey(opts.roomName),
      roomName: opts.roomName
    })
    await addPublicRoomToId(username, opts)
    resolve()
  })
}

export async function leavePublicRoom (username, roomName) {
  return new Promise((resolve) => {
    const localDb = await getLocalDb(username)
    await localDb.removeSwarmConfig(deriveRoomKey(roomName), 'publicRoom')
    await localDb.removeSwarmConfig(derivePublicManifestKey(roomName), 'publicManifest')
    await removePublicRoomFromId(username, roomName)
    return resolve()
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

export async function addPublicRoomToId (username, opts) {
  const id = await getIdentityInstance(username, {})
  await id.addAppData({
    appName: "dmessenger",
    dataType: "publicRooms",
    data: {
      roomName: opts.roomName,
      isCreator: opts.isCreator,
      roomKey: deriveRoomKey(roomName)
    },
    keyName: roomName
  })
}

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

export async function joinPrivateRoom (username, opts) {
  return new Promise((resolve, reject) => {
    if (isUserBlocked('privateRoom', opts.roomName, username)) return reject()
    const localDb = await getLocalDb(username)
    await localDb.addSwarmConfig('privateRoom', {
      lookup: opts.swarm.lookup,
      announce: opts.swarm.announce,
      discoveryKey: opts.discoveryKey,
      creator: opts.creator,
      roomName: opts.roomName
    })
    await localDb.addSwarmConfig('privateManifest', {
      lookup: opts.swarm.lookup,
      announce: opts.swarm.announce,
      discoveryKey: derivePrivateManifestKey(roomName),
      roomName: opts.roomName
    })
    await localDb.addPrivateRoom(opts.roomName, opts.isCreator)
    return resolve()
  })
}

export async function leavePrivateRoom (username, key, roomName) {
  return new Promise((resolve) => {
    const localDb = await getLocalDb(username)
    await localDb.removeSwarmConfig(key, 'privateRoom')
    await localDb.removeSwarmConfig(derivePrivateManifestKey(roomName), 'privateManifest')
    await localDb.removePrivateRoom(roomName)
    return resolve()
  })
}

export async function messageLegit (message, signature, user) {
  const query = new IdQuery(user)
  const key = await query.getRemoteKey('publicKey')
  return verify(message, signature, key)
}

export function derivePublicManifestKey (roomName) {
  return crypto.createHash('sha256').update(roomName + 'manifest').digest()
}

export function deriveModKey (username) {
  return crypto.createHash('sha256').update(username + 'mod').digest()
}

export function derivePrivateManifestKey (roomKey) {
  return crypto.createHash('sha256').update(roomName + 'private' + '/' + 'manifest').digest()
}

export function deriveRoomKey (roomName) {
  return crypto.createHash('sha256').update(roomName).digest()
}