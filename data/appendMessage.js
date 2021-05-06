/**
File: data/appendMessage.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This file exports a function that can be used to append a message to a room's NeutronDB. The appendMessage function accepts an object of the following form:

opts = {
  username: jared,
  message: <message-data>
  roomName: hodlers
}

A timestamp is automatically generated and included in the actual appended message, along with a "type", which in this case is "chat-message". The type can be used by dMessenger's various data views (see /data/views/timestampView.js), to organize messages in a createReadStream by a specific data type (like a timestamp in the above case). This is used by both public room and private rooms, since message data can be stored in an encrypted format.
*/

import { getDb } from './getData'

export default async function appendMessage (opts) {
  if (!opts.username) throw new Error('username is required in opts')
  if (!opts.message) throw new Error('message is required in opts')
  if (!opts.roomName) throw new Error('roomName is required in opts')

  if (typeof opts != 'object')
    throw new Error('opts must be an object')

  let db = await getDb(roomName)

  db.writer('local', (err, feed) => {
    feed.append({
      type: 'chat-message',
      username: opts.username,
      message: opts.message,
      roomName: opts.roomName,
      timestamp: new Date().toISOString()
    }, (err, seq) => {
      if (err) throw err
      console.log(`Message was appended to ${opts.roomName} db at entry # ${seq}`)    
    })
  })
}
