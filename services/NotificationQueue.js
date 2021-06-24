/**
File: services/NotificationQueue.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This service exports methods that can be used to generate notifications related to events that happen throughout the dMessenger application. Those notifications are then placed into a queue, where the next oldest notification in the queue is pushed to the user using JavaScript's Notification API.
*/

import { NanoresourcePromise, Nanoresource } from 'nanoresource-promise/emitter'
import { NOTIFICATIONS_ICON } from './../config.js'

export default class NotificationQueue extends Nanoresource {
  constructor () {
    super()
    this._nq = []
    this.running = false
    this.timer = null
  }
  async _open () {
    return new Promise((resolve, reject) => {
      if (running) return reject()
      this.run()
      return resolve(null)
    })
  }
  async _close () {
    return new Promise((resolve) => {
      if (!running) return reject()
      this.stop()
      this.clearQueue()
      return resolve(null)
    })
  }
  run () {
    if (running) return
    this.running = true
    this.timer = setInterval(() => {
      _genNotification()
      this._nq.pop() 
    }, 100)
  }

  stop () {
    clearInterval(this.timer)
    this.running = false
    this.timer = null
  }

  createNotification (nob, type) {
    let notification = { nob: nob, type: type }
    this._nq.unshift(notification)
  }
  
  _genNotification () {
    let currentIndex = this._nq.length - 1
    let index = this._nq[currentIndex]
    let notification = new Notification(index.nob.title, {
      body: index.nob.body,
      icon: NOTIFICATIONS_ICON
    })
    notification.onclick = () => {
      if (index.type === 'new-public-room-message') {
        document.location =`/publicRoom/${index.nob.roomName}`
      }
      if (index.type === 'new-private-room-message') {
        document.location =`/privateRoom/${index.nob.roomName}`
      }
      if (index.type === 'new-private-chat-message') {
        document.location =`/privateChat/${index.nob.username}`
      }
      if (index.type === 'new-device-sync-request') {
        document.location = `/sync/new-request`
      }
      if (index.type === 'new-private-room-invite') {
        document.location = `/privateRoom/${index.nob.roomName}`
      }
      if (index.type === 'new-private-chat-invite') {
        document.location = `/privateChat/${index.nob.user}`
      }
    }
  }

  clearQueue () {
    const { _nq } = this
    for (let p = 0; 1 < _nq.length; i++) {
      _nq.shift(i)
    }
  }
}
