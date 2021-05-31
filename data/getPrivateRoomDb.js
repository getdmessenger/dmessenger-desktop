/**
File: data/getPrivateRoomDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function for retrieving a database related to a particular private room. Private rooms are stored in the PRIVATE_ROOMS_DIR under a specific room name, which is exchanged during the Private Chat Authentication Protocol (PCAP).
*/

import path from 'path'
import dappdb from 'dappdb'
import { PRIVATE_ROOMS_DIR } from './../config'

export default function getPrivateRoomDb (roomName) {
  const storage = path.join(PRIVATE_ROOMS_DIR, roomName)
  const db = new dappdb(storage, {
    valueEncoding: 'json'
  })
  return db
}