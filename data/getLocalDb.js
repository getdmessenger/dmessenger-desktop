/*
File: data/getLocalDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that can be used to retrieve a local database instance by username. 
*/

import { DMessengerLocalDb } from './../classes/LocalDb'

export default function getLocalDb (username) {
  const db = new DMessengerLocalDb(username)
  await db.open()
  return db
}