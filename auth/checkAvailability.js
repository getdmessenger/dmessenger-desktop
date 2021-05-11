/**
File: auth/checkAvailability.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module is used for checking the availability of usernames and room names, via the DHT. Both the checkUsernameAvailability and checkRoomNameAvailability functions are exported and can be used wherever.
*/

import { DWebIdentity } from '@dwebid/core'
import { getDhtNode } from './../swarm/getDhtNode'

const dht = getDhtNode()

async function checkUsernameAvailability (username) {
  dht.on('listening', searchUser(username)) 
}

async function checkRoomAvailability (roomName) {
  dht.on('listening', searchRoomName(roomName))
}

function searchUser (username) {
  const uB = Buffer.from(username)
  dht.muser.get(uB, (err, value) => {
    if (err) return true
    if (value) return true
  })
}

function searchRoomName (roomName) {
  const rB = Buffer.from(roomName)
  dht.room.get(rB, (err, value) => {
    if (err) return true
    if (value) return false
  })
}

export {
  checkUsernameAvailability,
  checkRoomNameAvailability
}