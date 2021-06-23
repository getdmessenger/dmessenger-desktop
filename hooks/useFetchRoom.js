/**
File: hooks/useFetchRoom.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This hook is used to fetch data (avatar, roomDescription, roomPolicy, moderators) related to public and private rooms from each of their manifest databases.
*/

import React, { useState, useEffect } from 'react'
import fs from 'fs'
import path from 'path'
import { getManifestDb } from './../data'
import { derivePublicManifestKey, derivePrivateManifestKey } from './../helpers/roomHelpers'
import { PUBLIC_MANIFESTS_DIR,
             PRIVATE_MANIFESTS_DIR, 
             PUBLIC_ROOM_AVATAR_DIR ,
             PRIVATE_ROOM_AVATAR_DIR } from './../config'

export default function useFetchRoom ({ type, room }) {
  const [ data, setData ] = useState()
  const [ avatar, setAvatar ] = useState()
  const [ avatarUrl, setAvatarUrl ] = useState()
  const [ roomDescription, setRoomDescription ] = useState()
  const [ roomPolicy, setRoomPolicy ] = useState()
  const [ moderators, setModerators ] = useState()
  const [ error, setError ] = useState()
  const [ loading, setLoading ] = useState(true)
  const [ manifestReplicated, setManifestReplicated ] = useState()

  const manifestExists = async name => {
    let manLocation = path.join((type === 'publicRoom')
                                                 ? {PUBLIC_MANIFESTS_DIR, name}
                                                 : {PRIVATE_MANIFESTS_DIR, name}
                                             )
    try {
      await fs.access(manLocation)
    } catch (err) {
      return false
    }
  }

  const manifestConfigExists = async name => {
    const { list } = await db.listTypeNetworkConfigs((type === 'publicRoom') ? 'publicManifest' : 'privateManifest')
    const exists = list.some(x => x.roomName === roomName)
    if (exists) return true
    else return false
  }

  useEffect(() => {
    (async () => {
      if (!manifestExists(room) && !manifestConfigExists(room)) {
        
        const key = (type === 'publicRoom') 
                            ? derivePublicManifestKey(room) 
                            : derivePrivateManifestKey(room)

        if (key) {
          db.addNetworkConfig((type === 'publicRoom') ? 'publicManifest' : 'privateManifest', {
            discoveryKey: key,
            announce: true,
            lookup: true,
            roomName: room
          })
          // wait on manifest data to replicate locally
          while (!manifestExists(room)) {
            setTimeout(() => setLoading(true), 3000)
          }
          setLoading(false)
          setManifestReplicated(true)
        }
      }
    })()
  })

  useEffect(() => {
    (async () => {
      if (manifestExists(room)) {
        let db = await getManifestDb(type, room)
        db.get('/roomData', (err, node) => {
          if (err) setError(err)
          setData(node.value)
          setAvatar(data.avatar)
          setDescription(data.description)
          setRoomPolicy(data.roomPolicy)
          setAvatarUrl((type === 'publicRoom')
                                ? PUBLIC_ROOM_AVATAR_DIR + room + '.gif'
                                : PRIVATE_ROOM_AVATAR_DIR + room + '.gif'
                             )
          fs.writeFile(avatarUrl, avatar)
          db.get('/moderators', (err, node) => {
            if (err) setError(err)
            setModerators(node.value)
          })
        })
      } else {
        setError('There was an error retrieving data from the manifest')
      }
    })()
  }, [manifestReplicated])

  return {
    loading,
    error,
    data,
    avatar,
    avatarUrl,
    roomDescription,
    roomPolicy,
    moderators,
    manifestReplicated 
  }
}
