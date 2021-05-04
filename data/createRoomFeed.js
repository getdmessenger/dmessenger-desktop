import neutron from '@neutrondb/core'
import { getDb } from './../core/getDb'

export default function createRoomFeed (opts) {
  let coreDb = await getDb()
  if (!opts.roomName)
    throw new Error('Must provide roomName in opts')

  if (!opts.creator)
    throw new Error('Must provide creator in opts')

  if (!opts.roomDescription)
    throw new Error('Must provide roomDescription in opts')

  if (!opts.roomAvatar)
    throw new Error('Must provide roomAvatar in opts')

  if (!opts.roomType)
    throw new Error('Must provide roomType in opts')

  coreDb.writer(opts.roomName, (err, feed) => {
    if (feed.length > 0) return false

    feed.append({
      type: 'room-info',
      creator: opts.creator,
      creationTimestamp: new Date().toISOString(),
      roomName: opts.roomName,
      roomDescription: opts.roomDescription,
      roomAvatar: opts.roomAvatar,
      roomType: opts.roomType
    })
    return true
  })
}