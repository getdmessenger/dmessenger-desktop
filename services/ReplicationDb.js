/**
File: services/ReplicationDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This helps power the stream service for PCAP and SMAP protocol requests. New stream-based protocol configurations can be added to the database, and the Controller (Controller.js) is able to pick up on these via createReadStream() and initiate the actual protocol stream with the intendedReceiver.
*/

import dwebtrie from 'dwebtrie'
import { NanoresourcePromise, Nanoresource } from 'nanoresource-promise/emitter'
import { getStoreInstance } from './../data/getStoreInstance'

export default class ReplicationDb extends Nanoresource {
  constructor (username) {
    super()
    this.basestore = getStoreInstance()
    this.username = username
    this._db = null
  }

  async _open () {
    this._namespacedStore = this.basestore.namespace(username + 'replicationDb')
    await this._namespacedStore.ready()
    const dbFeed = this._namespacedStore.default()
    this._db = dwebtrie(null, null, { feed: dbFeed })
    await new Promise((resolve, reject) => {
      this._db.ready(err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }

  async addStream (ptype, opts) {
    const key = SP + ptype + '/' + (type === 'smap') ? opts.roomName : opts.name + '/' + opts.intendedReceiver
    return new Promise((resolve, reject) => {
      this._db.put(key, opts, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }

  async removeStream (ptype, name, intendedReceiver) {
    const key = SP + ptype + '/' + name + '/' + intendedReceiver
    return new Promise((resolve, reject) => {
      this._db.del(key, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }

  async listStreamsByType (type) {
    const key = SP + type + '/'
    return this._db.createReadStream(key, { recursive: true })
  }
}