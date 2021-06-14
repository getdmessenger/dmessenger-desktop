/**
File: data/deleteMessage.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function for deleting messages from public rooms, private rooms and private chats.
*/

import { sign, randomBytes } from '@ddatabase/crypto'
import { getDb,
             getPrivateRoomDb,
             getPrivateChatDb } from './data'
import { Identity } from './../services/Identity'

export default async function deleteMessage(type, messageId, opts) {
  return new Promise((resolve, reject) => {
    let db
    const username = opts.username
    const id = new Identity(username)
    const { name, pin, oldTimestamp, encryptSeed } = opts
    const secret = id.decryptSecretKey('default', pin)
    const signature = sign(messageId, secret)
    const timestamp = oldTimestamp
    const message = { type: "deleted-message", messageId, signature, timestamp }
    if (type === 'publicRoom') db = await getDb(name)
    if (type === 'privateRoom') db = await getPrivateRoomDb(name)
    if (type === 'privateChat') db = await getPrivateChatDb(name)
    if (type === 'publicRoom') {
      db.writer('default', (err, writer) => {
        writer.append(message, (err) => {
          if (err) return reject()
          else return resolve()
        })
      })
    } else {
      let delKey = `/deleted/${messageId}`
      db.put(delKey, message, err => {
        if (err) return reject()
        else return resolve()
      })
    }
  })
}
