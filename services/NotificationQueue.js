/**
File: services/NotificationQueue.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This service exports methods that can be used to generate notifications related to events that happen throughout the dMessenger application. Those notifications are then placed into a queue, where the next oldest notification in the queue is pushed to the user using JavaScript's Notification API.
*/

import { NOTIFICATIONS_ICON } from './../config'
import { useNavigate } from 'react-router-dom'

export default class NotificationQueue {
  constructor () {
    this._nq = []
    this.running = false
    this.timer = null
  }
  createNotification (nob, type) {
    let notification = { nob, type }
    this._nq.unshift(notification)
  }
  run () {
    if (running) return
    this.running = true
    this.timer = setInterval(() => {
      _genNotification()
      this._nq.pop()
    }, 100)
    this.timer()
  }
  stop () {
    clearInterval(this.timer)
    this.running = false
    this.timer = null    
  }
  _genNotification () {
    let currentIndex = this.nq.length - 1
    let index = this._nq[currentIndex]
    let notification = new Notification(index.nob.title, {
      body: index.nob.body,
      icon: NOTIFICATIONS_ICON
    })
    notification.onclick = () => {
      if (index.type === 'new-public-room-message') {
        navigate(`/public/${index.nob.publicRoomName}`)
      }  else if (index.type === 'new-private-room-message') {
        navigate(`/private/${index.nob.privateRoomName}`)
      }  else if (index.type === 'new-private-message') {
        navigate(`/chat/${index.nob.withUser}`)
      }  else if (index.type === 'new-upvote') {
        navigate(`/bank/${index.nob.upvoteWallet}`)
      }  else if (index.type === 'new-private-convo-request') {
        navigate(`/chat/${index.nob.withUser}`)
      }  else if (index.type === 'new-device-sync-request') {
        navigate(`/settings/devices/new-sync/${index.nob.fromDeviceId}`)
      }
    }
  }
  clearQueue () {
    const { _nq } = this
    for (let p = 0; i < _nq.length; i++) {
      _nq.shift(i)
    }
  }
}