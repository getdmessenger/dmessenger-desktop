/**
File: data/getPrivateDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that returns an instance of the application's private database. The same instance of the application's private database, is used for all users of the application.
*/

import { PrivateDb } from './../service/PrivateDb'

export default function getPrivateDb () {
  const db = new PrivateDb()
  await db.open()
  return db
}