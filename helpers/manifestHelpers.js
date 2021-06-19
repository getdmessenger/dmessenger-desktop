/** 
File: helpers/manifestHelpers.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports helper functions for interfacing with a public or private room's manifest database (deleting messages, restoring messages, blocking users, unblocking users, checking moderator status, checking if users are blocked, and checking if messages are deleted.
*/

import { getManifestDb } from './../data/getManifestDb'

export async function isUserBlocked (roomName, roomType, username) {
  let db = await getManifestDb(roomType, roomName)
  db.get(`/blocked/${username}`, (err, nodes) => {
    if (err) return false
    let len = nodes.length
    if (nodes && nodes[len].value !== null) return true
  })
}

export async function isMessageDeleted (roomType, roomName, messageId) {
  let db = await getManifestDb(roomType, roomName)
  db.get(`/deleted/${messageId}`, (err, nodes) => {
    if (err) return false
    let len = nodes.length
    if (nodes && nodes[len].value !== null) return true
  })
}

export async function isModerator (moderator, roomType, roomName) {
  let db = await getManifestDb(roomType, roomName)
  db.get('/moderators', (err, nodes) => {
    if (err) return false
    let len = nodes.length
    if (nodes && nodes[len].value.includes(moderator)) {
      let localKey = db.local.key
      db.authorized(localKey, (err, auth) => {
        if (err) return false
        else if (auth === true) return true
        else return false
      })
    }
  })
}

export async function blockUser (username, roomType, roomName, moderator) {
  return new Promise((resolve, reject) => {
    if (! await isModerator(moderator, roomType, roomName))  return reject()
    let db = await getManifestDb(roomType, roomName)
    if (! await isUserBlocked(roomName, roomType, username)) {
      db.put(`/blocked/${username}`, {
        blockedBy: moderator,
        timestamp: new Date(),
        blockedUser: username
      }, err => {
        if (err) return reject()
        return resolve()
      })
    }
  })
}

export async function unblockUser (username, roomType, roomName, moderator) {
  return new Promise((resolve, reject) => {
    if (! await isModerator(moderator, roomType, roomName)) return reject()
    let db = await getManifestDb(roomType, roomName)
    if (await isUserBlocked(roomName, roomType, username)) {
      db.del(`/blocked/${username}`, err => {
        if (err) return reject()
        return resolve()
      })
    }
  })
}

export async function listBlockedUsers (roomType, roomName) {
  return new Promise((resolve, reject) => {
    let db = await getManifestDb(roomType, roomName)
    db.list('/blocked/', { recursive: true}, (err, list) => {
      if (err) return reject(err)
      return resolve(list.map(n => n.value))
    })
  })
}

export async function deleteMessage (moderator, roomType, roomName, user, messageId) {
  return new Promise((resolve, reject) => {
    if ( ! await isModerator(moderator, roomType, roomName)) return reject()
    let db = await getManifestDb(roomType, roomName)
    if (! await isMessageDeleted(roomType, roomName, messageId)) {
      db.put(`/deleted/${messageId}`, {
        messageId: messageId,
        deletedBy: moderator,
        timestamp: new Date(),
        user: user
      }, (err) => {
        if (err) return reject()
        return resolve()
      })
    }
  })
}

export async function restoreMessage (moderator, roomName, roomType, messageId) {
  return new Promise((resolve, reject) => {
    if (! await isModerator(moderator, roomType, roomName)) return reject()
    let db = await getManifestDb(roomType, roomName)
    if (await isMessageDeleted(roomType, roomName, messageId)) {
      db.del(`/deleted/${messageId}`, err => {
        if (err) return reject()
        return resolve()
      })
    }
  })
}

export async function listDeletedMessages (roomType, roomName) {
  return new Promise((resolve, reject) => {
    let db = await getManifestDb(roomType, roomName)
    db.list('/deleted/', (err, list) => {
      if (err) return reject(err)
      return resolve(list.map(n => n.value))
    })
  })
}

export async function addRoomData (roomName, roomType, opts, moderator) {
  return new Promise((resolve, reject) => {
    if (! await isModerator(moderator, roomType, roomName)) return reject()
    let db = await getManifestDb(roomType, roomName)
    db.put('/roomData', opts, (err) => {
      if (err) return reject()
      return resolve()
    })
  })
}

export async function getRoomData (roomName, roomType) {
  return new Promise((resolve, reject) => {
    let db = await getManifestDb(roomType, roomName)
    db.get('/roomData', (err, nodes) => {
      if (err) return reject()
      let len = nodes.length
      if (nodes && nodes[len].value !== null) return resolve(nodes[len].value)
    })
  })
}

export async function addModerator(name, type, opts) {
  return new Promise((resolve, reject) => {
    if (!(await isModerator(moderator, roomType, roomName)))  return reject()
    let db = await getManifestDb(roomType, roomName)
    const { id, moderator } = opts
    db.get('/moderators', (err, nodes) => {
      if (err) return reject()
      let len = nodes.length
      if (nodes && nodes[len].value !== null) {
        let currentModerators = nodes[len].value
        currentModerators.push(moderator)
        db.put('/moderators', currentModerators, (err) => {
          if (err) return reject()
          return resolve()
        })
      }
    })
  })
}