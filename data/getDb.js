/**
File: data/getDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This file exports a function that can used to create or retrieve a NeutronDB from a specific Basestore that is derived from the actual room name.
*/

import NeutronDB from '@neutrondb/core'
import { neutronOpts } from './../opts/neutronOpts'
import { getRoomStore } from './getRoomStore'

export default async function getDb (roomName) {
  let roomStore = getRoomStore(roomName)
  let db = new NeutronDB(roomStore, { valueEncoding: 'json' })
  return db
}