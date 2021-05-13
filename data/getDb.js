/**
Filename: data/getDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Module that exports the Neutron database related to a particular public room. A Neutron's discovery key is derived from the discoveryKey function, which uses '@multifeed:'+rootKey as a seed. 
*/
import NeutronDb from '@neutrondb/core'
import { deriveRootRoomKey } from './../crypto/deriveRootRoomKey'
import { neutronOpts } from './../opts/neutronOpts'
import { getStoreInstance } from './getStoreInstance'

export default async function getDb (roomName) {
  let rootKey = deriveRootRoomKey(roomName)
  let basestore = getStoreInstance()
  await basestore.ready()

  let db = new NeutronDb(basestore, {
    rootKey: rootKey,
    ...neutronOpts
  })

  return db  
}