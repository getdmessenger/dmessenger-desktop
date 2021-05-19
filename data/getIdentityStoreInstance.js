/**
File: data/getIdentityStoreInstance.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that returns a basestore instance located in a directory that derives from the ID_DIR config constant.
*/

import Basestore from 'basestorex'
import { ID_DIR } from './../config'
import { basestoreOpts } from './../opts/basestoreOpts'

export default async function getIdentityStoreInstance () {
  const store = new Basestore(ID_DIR, basestoreOpts)
  await store.ready()
  return store
}