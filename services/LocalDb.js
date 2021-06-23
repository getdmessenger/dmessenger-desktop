/*
File: services/LocalDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This service is used to manage dMessenger's local database. Each identity within the application utilizes its own local database, which is used to store the configurations related to swarms present in the application. A swarm could be the swarm for a private room, a public room, a private chat or even an identity document. More on how chat networking works, can be found in /docs/chat-networking.md.
*/

import dwebtrie from 'dwebtrie'
import { NanoresourcePromise, Nanoresource } from 'nanoresource-promise/emitter'
import { getStoreInstance } from './../data/getStoreInstance'

const SP = "!swarm!"

export default class DMessengerLocalDb extends Nanoresource {
  constructor (username) {
    super()
    this.basestore = getStoreInstance()
    this.username = username
    this._db = null
  }

  async _open() {
    this._namespacedStore = this.basestore.namespace(username + 'localdb')
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
  
  async addSwarmConfig (type, swarmConfig) {
    const keyString = swarmConfig.discoveryKey.toString('hex')
    return new Promise((resolve, reject) => {
      this._db.put(toDbKey(SP, type, keyString), swarmConfig, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }

  async removeSwarmConfig (key, type) {
    if (Buffer.isBuffer(key)) key = key.toString('hex')
    return new Promise((resolve, reject) => {
      this._db.del(toDbKey(SP, type, key), err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }

  async getSwarmConfig (key, type) {
    const keyString = (typeof key === 'string') ? key : key.toString('hex')
    return new Promise((resolve, reject) => {
      this._db.get((toDbKey, SP, type, key), (err, node) => {
        if (err) return reject(err)
        return resolve(node && node.value)
      })
    })
  }

  async listSwarmConfigurations () {
    return new Promise((resolve, reject) => {
      this._db.list(SP, (err, nodes) => {
        if (err) return reject(err)
        return resolve(nodes.map(n => n.value))
      })
    })
  }

  async listTypeSwarmConfigs (type) {
    return new Promise((resolve, reject) => {
      this._db.list(toDbKey(SP, type), (err, nodes) => {
        if (err) return reject(err)
        return resolve(nodes.map(n => n.value))
      })
    })
  }

  async addPrivateRoom (roomName, isCreator) {
    const obj = { roomName, isCreator } 
    return new Promise((resolve, reject) => {
      this._db.put(`/privateRooms/${roomName}`, obj, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }
  
  async removePrivateRoom (roomName) {
    return new Promise((resolve, reject) => {
      this._db.del(`/privateRooms/${roomName}`, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }
  
  async getPrivateRoom (roomName) {
    return new Promise((resolve, reject) => {
      this._db.get(`/privateRooms/${roomName}`, (err, node) => {
        if (err) return reject(err)
        return resolve(node && node.value)
      })
    })
  }
  
  async listPrivateRooms () {
    return new Promise((resolve, reject) => {
      this._db.list('/privateRooms/', (err, nodes) => {
        if (err) return reject(err)
        return resolve(nodes.map(n => n.value))
      })
    })
  }
  
  async addPrivateChat (user, isCreator) {
    const obj = { user, isCreator } 
    return new Promise((resolve, reject) => {
      this._db.put(`/privateChats/${user}`, obj, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }
  
  async removePrivateChat (user) {
    return new Promise((resolve, reject) => {
      this._db.del(`/privateChats/${user}`, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }
  
  async getPrivateChat (user) {
    return new Promise((resolve, reject) => {
      this._db.get(`/privateChats/${user}`, (err, node) => {
        if (err) return reject(err)
        return resolve(node && node.value)
      })
    })
  }
  
  async listPrivateChats () {
    return new Promise((resolve, reject) => {
      this._db.list('/privateChats/', (err, nodes) => {
        if (err) return reject(err)
        return resolve(nodes.map(n => n.value))
      })
    })
  }
  
  async savePrivateRoomSeed (roomName, seed) {
    return new Promise((resolve, reject) => {
      this._db.put(`/roomSeed/${roomName}`, seed, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }
  
  async getPrivateRoomSeed (roomName) {
    return new Promise((resolve, reject) => {
      this._db.get(`/roomSeed/${roomName}`, (err, node) => {
        if (err) return reject(err)
        return resolve(node && node.value)
      })
    })
  }
  
  async removePrivateRoomSeed (roomName) {
    return new Promise((resolve, reject) => {
      this._db.del(`/roomSeed/${roomName}`, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }
  
  async savePrivateChatSeed (username, seed) {
    return new Promise((resolve, reject) => {
      this._db.put(`/chatSeed/${username}`, seed, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }
  
  async getPrivateChatSeed (username) {
    return new Promise((resolve, reject) => {
      this._db.get(`/chatSeed/${username}`, (err, node) => {
        if (err) return reject(err)
        return resolve(node && node.value)
      })
    })
  }
  
  async removePrivateChatSeed (roomName) {
    return new Promise((resolve, reject) => {
      this._db.del(`/chatSeed/${username}`, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }

  async getSettings () {
    return new Promise((resolve, reject) => {
      this._db.get('/settings', (err, node) => {
        if (err) return reject(err)
        return resolve(node && node.value)
      })
    })
  }
  
  async putSettings (settings) {
    return new Promise((resolve, reject) => {
      this._db.put('/settings', settings, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }

  async liveStreamSwarms (type) {
    return this._db.createReadStream(`/network/${type}`, { recursive: true })
  }
  
  async acceptChat (type, name) {
    return new Promise((resolve, reject) => {
      this._db.put(`/acceptedChats/${type}/${name}`, {
        name: name,
        type: type
      }, err => {
        if (err) return reject(err)
        return resolve(null)
      })
    })
  }
  
  async isChatAccepted (type, name) {
    this._db.get(`/acceptedChats/${type}/${name}`, (err, node) => {
      if (err) return false
      else return true
    })
  }
  
  async getDb () {
    return this._db
  }

   
}

function toDbKey (prefix, type, key) {
  return prefix + type + '!' + key
}