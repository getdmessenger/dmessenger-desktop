/**
File: classes/localDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This allows dMessenger to move beyond using the dHub client/server software for managing local network configurations. This brings a "batteries included" experience to dMessenger, when it comes to managing and replicating dDatabase-based data structures. Instead, local network configurations are stored in a multi-dTree and can be shared between a user's devices. This means, for every single swarm configuration created via startRoomSwarm or startIdentitySwarm, they are saved in this database, so that upon restarting dMessenger, we can restart all of these swarms at once, since each separate swarm configuration is listed in this local database (see listNetworkConfigurations() method below). Since this localDb is a publicly available database, associated with the user (within the user's identity document), when a user starts up dMessenger on a new device, these local settings automatically move to the new device. 

NOTE: I pulled some parts from the original hyperspace library and customized it to work wtih a multi-dwebtree, rather than a dwebtrie. 
*/

import { NanoresourcePromise, Nanoresource } from 'nanoresource-promise/emitter'
import { MultiDWebTree } from 'multi-dwebtree'
import { NetworkStatus } from '@dhub/rpc/messages'
import { getBaseInstance } from './../data/getBaseInstance'
import { dTreeOpts } from './../opts/dTreeOpts'

const INTERNAL_NAMESPACE = '@dmessenger:internal'
const ROOM_PREFIX = 'network/room'
const LOCAL_PREFIX = 'network/local'

export default class DMessengerLocalDb extends Nanoresource {
  constructor () {
    super()
    this.basestore = getBaseInstance()
    this._db = null
  }

  async _open () {
    this._namespacedStore = this.basestore.namespace(INTERNAL_NAMESPACE)
    await this._namespacedStore.ready()
    const dbFeed = this._namespacedStore.default()
    this._db = new MultiDWebTree(dbFeed, dTreeOpts)
    await new Promise((resolve, reject) => {
      this._db.ready(err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }

  async setUserConfig (name, value) {
    return new Promise((resolve, reject) => {
      this._db.put('config/' + name, value, (err) => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }

  async getUserConfig (name) {
    return new Promise((resolve, reject) => {
      this._db.get('config/' + name, (err, node) => {
        if (err) return reject(err)
        return resolve(node && node.value)
      })
    })
  }

  async deleteUserConfig (name) {
    return new Promise((resolve, reject) => {
      this._db.del('config/' + name, (err) => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }

  async putNetworkConfiguration (type, networkConfiguration) {
    const dkeyString = networkConfiguration.discoveryKey.toString('hex')
    return new Promise((resolve, reject) => {
      this._db.put(toDbKey(
        isTypeRoom(type) ? ROOM_PREFIX : LOCAL_PREFIX, 
        dkeyString
       ), NetworkStatus.encode(networkConfiguration), err => {
          if (err) return reject(err)
          return resolve(null)
      })
    })
  }

  async removeNetworkConfiguration (type, discoveryKey) {
    if (Buffer.isBuffer(discoveryKey)) discoveryKey = discoveryKey.toString('hex')
    return new Promise((resolve, reject) => {
      this._db.del(toDbKey(isTypeRoom(type) ? ROOM_PREFIX : LOCAL_PREFIX, discoveryKey), err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }

  async getNetworkConfiguration (type, dk) {
    const dkeyString = (typeof discoveryKey === 'string') ? discoveryKey : discoveryKey.toString('hex')
    return new Promise((resolve, reject) => {
      this._db.get(toDbKey(IsTypeRoom(type) ? ROOM_PREFIX : LOCAL_PREFIX, dkeyString), (err, node) => {
        if (err) return reject(err)
        return resolve(node && NetworkStatus.decode(node.value))
      })
    })
  }

  async listNetworkConfigurations () {
    return new Promise ((resolve, reject) => {
      this._db.list(isTypeRoom(type) ? ROOM_PREFIX : LOCAL_PREFIX, (err, nodes) => {
        if (err) return reject(err)
        return resolve(nodes.map(n => NetworkStatus.decode(n.value)))
      })
    })
  }
}

function toDbKey (prefix, key) {
  return prefix + '/' + key
}

function isTypeRoom (type) {
  if (type === 'room') return true
  else return false
}