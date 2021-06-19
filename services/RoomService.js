import { USwarm } from '@uswarm/core'

export default class RoomService {
  constructor (room) {
    this.dht = new USwarm({
      ephemeral: true
    })
    this.room = room
  }

  async getManifestKey () {
    const { dht, room, type } = this
    const rB = Buffer.from(room)
    return new Promise((resolve, reject) => {
      dht.on('listening', rB => {
        dht.room.get(rB, (err, value) => {
          if (err) return reject({ error: err })
          return resolve({ manifestKey: value.value.publicKey })
        })
      })
    })
  }

  checkRoomAvailability () {
    const { dht, room, type } = this
    const rB = Buffer.from(room)
    dht.on('listening', rB => {
      dht.room.get(rB, (err, value) => {
        if (err) return true
        else return false
      })
    })
  }

  register (manifestKey) {
    const { dht, room, type } = this
    return new Promise((resolve, reject) => {
      const rB = Buffer.from(room)
      dht.on('listening', rB => {
       dht.room.put(rB, { manifestKey, creator: "dmessenger" }, (err, { key, ...info }) => {
         if (err) return reject()
         if (key) return resolve()
       })
     })
   })
  }
}