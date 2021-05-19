import dwebtrie from 'dwebtrie'
import { NanoresourcePromise , Nanoresource } from 'nanoresource-promise-emitter'
import { NetworkStatus } from '@dhub/rpc/messages'
import { getPrivateStore } from '../data/getPrivateStore'
import { ID_PREFIX } from './../config'
import { trieOpts } from './../opts/trieOpts'

module.exports = class PrivateDb extends Nanoresource {
  constructor () {
    super()
    this.basestore = getPrivateStore()
    this._db = null
  }
  async _open () {
    await this.basestore.ready()
    const dbFeed = this.basestore.default()
    this._db = dwebtrie(null, null, { feed: dbFeed })
    await new Promise((resolve, reject) => {
      this._db.ready(err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }
  async addIdentity (username, value) {
    return new Promise((resolve, reject) => {
      this._db.put(ID_PREFIX + username, value, (err) => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }
  async getIdentity (username) {
    return new Promise((resolve, reject) => {
      this._db.get(ID_PREFIX + username, (err, node) => {
        if (err) return reject(err)
        return resolve(node && node.value)
      })
    })
  }
  async deleteIdentity (username) {
    return new Promise((resolve, reject) => {
      this._db.del(ID_PREFIX + username, (err) => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }
  async listIdentities () {
    return new Promise((resolve, reject) => {
      this._db.list(ID_PREFIX, (err, nodes) => {
        if (err) return reject(err)
        return resolve(nodes.map(n => n.value))
      })
    })
  }
  async addEncryptionSeed (seed, user) {
    return new Promise((resolve, reject) => {
      this._db.put('SEED/' + user, seed, (err) => {
        if (err) return reject(err)
        return resolve(null)
      })
    }) 
  }
  async getEncryptionSeed (user) {
    return new Promise((resolve, reject) => {
      this._db.get('SEED/' + user, (err, node) => {
        if (err) return reject(err)
        return resolve(node && node.value)
      })
    })
  }
  async getSalt (user) {
    return new Promise((resolve, reject) => {
      this._db.get('SALT/' + user, (err, node) => {
        if (err) return reject(err)
        return resolve(node && node.value)
      })
    })
  }
  
  async storeSalt (salt, user) {
    return new Promise((resolve, reject) => {
      this._db.put('SALT/' + user, salt, (err) => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }  
}