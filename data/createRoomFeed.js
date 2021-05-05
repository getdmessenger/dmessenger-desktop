/**
File: data/createRoomFeed.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This file exports a function that is used to create an initial feed for a chat room. The first block in any room's NeutronDB and it's original underlying 'local' feed, contains the following data at block #0 (seq #0):
block0 = {
  type: 'room-info',
  creator: "jared",
  creationTimestamp: timestamp,
  roomName: "hodlers",
  roomDescription: "A chat for hodlers.",
  roomAvatar: "<binary-image-data>",
  roomType: "public"
}

This way, when doing a createReadStream on a particular NeutronDB, we can insure that it's related to the room we're looking for. While a NeutronDB contains multiple feeds, 
*/

import { getDb } from './getDb'

export default function createRoomFeed (opts) {
  let db = await getDb(opts.roomName)
  if (!opts.roomName) throw new Error('Must provide roomName in opts')
  if (!opts.creator) throw new Error('Must provide creator in opts')
  if (!opts.roomDescription) throw new Error('Must provide roomDescription in opts')
  if (!opts.roomType) throw new Error('Must provide roomType in opts')

  db.writer('local', (err, feed) => {
    if (feed.length > 0) return false
    feed.append({
      type: 'room-info',
      creator: opts.creator,
      creationTimestamp: new Date().toISOString(),
      roomName: opts.roomName,
      roomDescription: opts.roomDescription,
      roomAvatar: opts.roomAvatar,
      roomType: opts.roomType
    })
    return true
  })
}