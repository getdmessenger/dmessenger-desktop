/**
File: data/editMessage.js
Author: Jared Rice Sr.
Description: This module exports a function that's used for editing messages within public rooms, private rooms and private chats.
*/

import { sign, randomBytes } from '@ddatabase/crypto'
import { getDb,
             getPrivateRoomDb,
             getPrivateChatDb } from './data'
import { Identity } from './../services/Identity'

export default async function editMessage(type, messageId, message, opts) {
  return new Promise((resolve, reject) => {
    let db;
    if (type === 'publicRoom') db = await getDb(name)
    if (type === 'privateRoom') db = await getPrivateRoomDb(name)
    if (type === 'privateChat') db = await getPrivateChatDb(name)
    const username = opts.username
    const id = new Identity(username)
    const { name, pin, oldTimestamp, encryptSeed , isReply, isReplyTo} = opts
    const secret = id.decryptSecretKey('default', pin)
    const signature = sign(message, secret)
    const editedTimestamp = new Date().toISOString()


    const messageObj = {
        type: "edited-message",
        username: username,
        messageId: messageId,
        message: message,
        signature: signature,
        isReply: (isReply)
        ? {isReply: true,
          isReplyTo: isReplyTo}
        : {isReply: false,
          isReplyTo: null},
        timestamp: oldTimestamp,
        editedTimestamp: editedTimestamp,
        
      }

    if (type === 'publicRoom') {
      db.writer('default', (err, writer) => {
        writer.append(messageObj, err => {
          if (err) return reject()
          else return resolve()
        })
      })
    }  else {
      let editedKey = `/edited/${messageId}`
      db.put(editedKey, messageObj, err => {
        if (err) return reject()
        else return resolve()
      })
    }
  })
}