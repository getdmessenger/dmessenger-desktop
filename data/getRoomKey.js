/**
File: data/getRoomKey.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module is used to extract the public key from a public room's NeutronDB-based multifeed.
*/

import { getDb } from './getDb'

export default async function getRoomKey (roomName) {
  const roomDb = await getDb(roomName)
  const roomKey = roomDb.key.toString('hex')

  return roomKey
}