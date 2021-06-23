/**
File: data/getManifestDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that retrieves a manifest database by type.
*/

import path from 'path'
import dappdb from 'dappdb'
import { PRIVATE_MANIFEST_DIR,
             PUBLIC_MANIFEST_DIR } from './../config'

export default function getManifestDb (type, roomName) {
  const storage = path.join((type === 'publicRoom')
                                           ? (PUBLIC_MANIFESTS_DIR, roomName)
                                           : (PRIVATE_MANIFESTS_DIR, roomName)
                                        )
  const db = new dappdb(storage, {
    valueEncoding: 'json'
  })

  return db
}