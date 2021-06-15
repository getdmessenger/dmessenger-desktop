/** 
File: data/createMessage.js
Author: Jared Rice Sr. <jared@peepsx.com
Description: This module exports a function that is used for creating a message within a public room, private room
or private chat's database.
*/

import AES from 'aes-oop'
import { sign, randomBytes } from '@ddatabase/crypto'
import { Identity } from './../services/Identity'
import { getDb,
             getPrivateRoomDb,
             getPrivateChatDb } from './data'

export default async function createMessage(type, message, opts) {
  return new Promise((resolve, reject) => {
    let db
    const username = opts.username
    const id = new Identity(username)
    const { name, pin, isReply, isReplyTo, encryptSeed } = opts
    const secret = id.decryptSecretKey('default', pin)
    const signature = sign(message, secret)
    const timestamp = new Date().toISOString()
    const messageId = randomBytes(32)
    if (type === 'publicRoom') db = await getDb(name)
    if (type === 'privateRoom') db = await getPrivateRoomDb(name)
    if (type === 'privateChat') db = await getPrivateChatDb(name)
    if (type === 'privateRoom' || type === 'privateChat') {
      message = encrypt(message, opts.encryptSeed)
    }
    const messageObj = {
      type: "chat-message",
      username: username,
      messageId: messageId,
      message: message,
      signature: signature,
      isReply : isReply ? {isReply: true, isReplyTo: isReplyTo} : {isReply: false, isReplyTo: null},
      timestamp: timestamp,
    }

    if (type === 'publicRoom') {
      db.writer('default', (err, writer) => {
        writer.append(messageObj, (err) => {
          if (err) return reject()
          else return resolve()
        })
      })
    }

    else {
      let putKey = `/messages/${username}/${messageId}`
      db.put(putKey, messageObj, err => {
        if (err) return reject()
        else return resolve()
      })
    }    
  })
}

function encrypt (message, seed) {
  return AES.encrypt(message, seed)
}


/**
File: data/createMessage.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Function for creating messages in public/private rooms and private chats.
*/

import AES from 'aes-oop'
import { sign, randomBytes } from '@ddatabase/crypto'
import { getDb, getPrivateRoomDb, getPrivateChatDb } from './data'
import { Identity } from './../services/Identity'

export default async function dispatchMessage(type, message, opts) {
  return new Promise((resolve, reject) => {
    let db
    const username = opts.username
    const id = new Identity(username)
    const { name, pin, isReply, isReplyTo, encryptSeed } = opts
    const secret = id.decryptSecretKey('default', pin)
    const signature = sign(message, secret)
    const timestamp = new Date()
    const messageId = randomBytes(32)
    if (type === 'publicRoom') db = await getDb(name)
    if (type === 'privateRoom') db = await getPrivateRoomDb(name)
    if (type === 'privateChat') db = await getPrivateChatDb(name)
    if (type === 'privateRoom' || type === 'privateChat') {
      message = encrypt(message, opts.encryptSeed)
    }

    const messageObj = {
      type: "chat-message",
      name: name,
      username: username,
      messageId: messageId,
      message: message,
      signature: signature,
      isReply : (isReply)  ? {isReply: true, isReplyTo: isReplyTo }: {isReply: false, isReplyTo: null},
      timestamp: timestamp 
    }

    if (type === 'publicRoom') {
      db.writer('default', (err, writer) => {
        writer.append(messageObj, (err) => {
          if (err) return reject()
          else return resolve()
        })
      })
    } else {
      let putKey = `/messages/${messageId}`
      db.put(putKey, messageObj, err => {
        if (err) return reject()
        else return resolve()
      })
    }
  })
}

function encrypt (message, seed) {
  return AES.encrypt(message, seed)
}