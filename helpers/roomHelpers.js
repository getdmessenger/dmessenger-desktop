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
import moment from 'moment-timezone'
import Query from '@neutrondb/view-query'
import memdb from 'memdb'
import collect from 'collect-stream'
import { getPrivateRoomDb } from './../data/getPrivateRoomDb'
import { getDb } from './../data/getDb'

export async function joinPublicRoom (username, opts) {
  return new Promise((resolve) => {
    const localDb = await getLocalDb(username)
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
    await addUserToPublicRoom(opts.roomName, opts.signature, username)
    resolve()
  })
}

export async function leavePublicRoom (username, roomName, signature) {
  return new Promise((resolve) => {
    const localDb = await getLocalDb(username)
    await localDb.removeSwarmConfig(deriveRoomKey(name), 'publicRoom')
    await localDb.removeSwarmConfig(derivePublicManifestKey(roomName), 'publicManifest')
    await removePublicRoomFromId(username, roomName)
    await announcePublicDeparture(roomName, username, signature)
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
  return new Promise((resolve => {
    const localDb = await getLocalDb(username)
    await localDb.addSwarmConfig('privateRoom', {
      lookup: opts.swarm.lookup,
      announce: opts.swarm.announce,
      discoveryKey: opts.swarm.discoveryKey,
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
    await addUserToPrivateRoom(username, opts.roomName)
    return resolve()
  }))
}

export async function leavePrivateRoom (username, key, roomName) {
  return new Promise((resolve) => {
    const localDb = await getLocalDb(username)
    await localDb.removeSwarmConfig(key, 'privateRoom')
    await localDb.removeSwarmConfig(derivePrivateManifestKey(roomName), 'privateManifest')
    await localDb.removePrivateRoom(roomName)
    await removePrivateRoomUser(username, roomName)
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

export function getOldestTimestamp (messages) {
  let pArray = messages
  let sort = pArray.sort((a,b) => {
    a.timestamp < b.timestamp
  })
  return sort[0].timestamp
}

export function convertToEstimate (timestamp) {
  let now = new Date()
  let since = now - timestamp
  let converted = since / 1000
  return moment().subtract(converted, 'seconds').fromNow()
}

export async function addUserToPrivateRoom (name, user) {
  return new Promise((resolve, reject) => {
    let db = await getPrivateRoomDb(name)
    db.put(`/users/${user}`, user, err => {
      if (err) return reject(err)
      return resolve(null)
    })
  })
}

export async function addUserToPublicRoom (name, signature, user) {
  return new Promise((resolve, reject) => {
    let db = await getDb(name)
    db.writer('local', (err, writer) => {
      let entry = {
        type: "user",
        user: user,
        signature: signature,
        timestamp: new Date()
      }
      writer.append(entry, (err) => {
        if (err) return reject()
        return resolve()
      })
    })
  })
}

export async function getPrivateRoomUserList (name) {
  return new Promise((resolve, reject) => {
    let db = await getPrivateRoomDb(name)
    db.list('/users/', (err, list) => {
      if (err) return reject(err)
      return resolve(list.map(n => n.value))
    })
  })
}

export async function isPrivateRoomUser (user, name) {
  let db = await getPrivateRoomDb(name)
  db.get(`/users/${user}`, (err, nodes) => {
    if (err) return false
    else return true
  })
}

export async function isPublicRoomUser (user, name) {
  let list = await listPublicRoomUsers(name)
  let exists = list.some(x => x.user === user)
  if (exists) return true
  else return false
}

export async function listPublicRoomUsers (name) {
  return new Promise((resolve, reject) => {
    let base = getDb(name)
    let db = memdb()
    const validator = msg => {
      //TODO check if user has left ("leaving-user" type)
      if (!messageLegit(msg.user, msg.signature, msg.user)) return null
    }
    const indexes = [
      { key: 'usr', value: ['value', 'user']},
      { key: 'typ', value: [['value', 'type'], ['value', 'user']]}
    ]
    base.use('query', Query(db, { indexes, validator }))
    const query = [{ $filter: {value: {type: 'user' }} }]
    base.ready('query', () => {
      let users = []
      msgs.forEach(m => {
        let list = await listPublicDepartures(name)
        let departedRecord = list.filter(x => m.user === x.user)
        if (departedRecord.length && m.timestamp > departedRecord.timestamp) {
          let exists = users.some(x => x.user === muser && x.timestamp === m.timestamp)
          if (!exists) users.push({ user: m.user, timestamp: m.timestamp })
        }
      })
      return resolve(users)
      return resolve(users)
    })
  })
}

export async function listPublicDepartures (name) {
  return new Promise((resolve, reject) => {
    let base = getDb(name)
    let db = memdb()
    const validator = msg => {
      if (!messageLegit(msg.user, msg.signature, msg.user)) return null
      return msg
    }
    const indexes = [
      { key: 'dep', value: ['value', 'user'] },
      { key: 'typ', value: [['value', 'type'], ['value', 'user']]}
    ]
    base.use('query', Query(db, { indexes, validator }))
    const query = [{ $filter: { value: { type: 'departing'} } }]
    base.ready('query', () => {
      collect(base.api.query.read({query}), (err, msgs) => {
        let users = []
        msgs.forEach(m => {
          let exists = msgs.some(x => x.user === m.user)
          if (exists) {
            let reduced = msgs.filter(x => x.user === m.user)
                                        .reduce((x, y) => (x.timestamp > y.timestamp) ? x : y)
            let userExists = users.some(x => x.timestamp === reduced.timestamp && x.user === reduced.user)
            if (!userExists) users.push({ user: reduced.user, timestamp: reduced.timestamp })
          }
        })
        return resolve(users)
      })  
    })
  })
}

export async function announcePublicDeparture (name, user, signature) {
  return new Promise((resolve, reject) => {
    let db = await getDb(name)
    db.writer('default', (err, writer) => {
      if (err) return reject()
      let entry = {
        type: "departing",
        user: user,
        signature: signature,
        timestamp: new Date()
      }
      writer.append(entry, () => {
        return resolve()
      })
    })
  })
}
