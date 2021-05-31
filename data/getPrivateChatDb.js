/**
File: data/getPrivateChatDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function for retrieving a database related to a particular private chat. There can only be one private chat, for each individual user, so they are stored by username.
*/

import path from 'path'
import dappdb from 'dappdb'
import { PRIVATE_CHAT_DIR } from './../config'

export default function getPrivateChatDb (username) {
  const storage = path.join(PRIVATE_CHAT_DIR, username)
  const db = new dappdb(storage, {
    valueEncoding: 'json'
  })

  return db
}
