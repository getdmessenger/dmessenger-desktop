/**
File: helpers/reactionHelpers.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: These are helper functions used by the ReactionBar component (components/ReactionBar.js)
*/

import { sign } from '@ddatabase/crypto'
import { Identity } from './../services'
import { getDb, getPrivateRoomDb } from './../data'

export function likeMessage (name, type, opts) {
  return new Promise((resolve, reject) => {
    const id = new Identity(opts.user)
    const secret = id.decryptSecretKey('default', pin)
    const signature = sign(opts.messageId, secret)
    const data = {
      type: "like",
      messageId: opts.messageId,
      signature: signature,
      user: opts.user,
      timestamp: new Date()
    }
    if (type === 'publicRoom') {
      let db = await getDb(name)
      db.writer('default', (err, writer) => {
        writer.append(data, err => {
          if (err) return reject()
          else return resolve()
        })
      })
    }  else {
      let db = await getPrivateRoomDb(name)
      let key = `/likes/${opts.messageId}/${opts.user}`
      db.put(key, data, err => {
        if (err) return reject()
        else return resolve()
      })
    }
  })
}

export function unlikeMessage (name, type, opts) {
  return new Promise((resolve, reject) => {
    const id = new Identity(opts.user)
    const secret = id.decryptSecretKey('default', pin)
    const signature = sign(opts.messageId, secret)
    const data = {
      type: "unlike",
      messageId: opts.messageId,
      signature: signature,
      user: opts.user,
      timestamp: new Date()
    }
    if (type === 'publicRoom') {
      let db = await getDb(name)
      db.writer('default', (err, writer) => {
        writer.append(data, err => {
          if (err) return reject()
          else return resolve()
        })
      })
    }  else {
      let db = await getPrivateRoomDb(name)
      let key = `/likes/${opts.messageId}/${opts.user}`
      db.del(key, err => {
        if (err) return reject()
        else return resolve()
      })
    }
  })
}