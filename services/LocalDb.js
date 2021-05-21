/**
File: classes/localDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This class is used by dMessenger to interact with the local database (store, retrieve, list and delete various dSwarm network configurations with a particular user. Each user maintains their own localDb, since its basestore is derived from their username (see below).
*/

import MultiDTree from 'multi-dwebtree'
import { NanoresourcePromise, Nanoresource } from 'nanoresource-promise/emitter'
import { NetworkStatus } from '@dhub/rpc/messages'
import { getStoreInstance } from '../data/getStoreInstance'
import {
  ROOM_PREFIX,
  LOCAL_PREFIX } from './../config'
import { dTreeOpts } from '../opts/dTreeOpts'

module.exports = class DMessengerLocalDb extends Nanoresource {
  construction (username) {
    super() 
    this.basestore = getStoreInstance()
    this._db = null
    this.username = username
  }
  async _open () {
    this._namespacedStore = this.basestore.namespace(this.username)
    await this._namespacedStore.ready()
    this._db = new MultiDTree(this._namespacedStore, dTreeOpts)
    await new Promise((resolve, reject) => {
      this._db.ready( err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }
  async putNetworkConfiguration (type, networkConfiguration) {
    const dkeyString = networkConfiguration.discoveryKey.toString('hex')
    await this._db.put(
      toDbKey(isTypeRoom(type) ? ROOM_PREFIX : LOCAL_PREFIX, dkeyString), 
      NetworkStatus.encode(networkConfiguration)
    )
  }
  
  async removeNetworkConfiguration (type, discoveryKey) {
    if (Buffer.isBuffer(discoveryKey)) discoveryKey = discoveryKey.toString('hex')
    await this._db.del(toDbKey(isTypeRoom(type) ? ROOM_PREFIX : LOCAL_PREFIX, discoveryKey))
  }

  async getNetworkConfiguration (type, discoveryKey) {
    const dkeyString = (typeof discoveryKey === 'string') ? discoveryKey : discoveryKey.toString('hex')
    const { key, value } = await this._db.get(toDbKey(isTypeRoom(type) ? ROOM_PREFIX : LOCAL_PREFIX, discoveryKey))
    if (key !== null) return { key, value }
  }

  async listNetworkConfigurations (type) {
    if (isTypeRoom('room')) {
      return await this._db.createReadStream({
        gte: ROOM_PREFIX
      })
    } else {
      return await this._db.createReadStream({
        lte: LOCAL_PREFIX
      })
    }
  }
}

function toDbKey (prefix, key) {
  return prefix + '/' + key
}

function isTypeRoom(type) {
  if (type === 'room') return true
}