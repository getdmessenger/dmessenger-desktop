/**
File: hooks/useFetchUser.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This hook is used to fetch a user's public key for their identity document via dWeb's DHT, replicates the identity document on the user's local device and then returns the user's data.
*/

import React, { useState, useEffect } from 'react'
import { IdQuery } from '@dwebid/query'
import fs from 'fs'
import path from 'path'
import { identityExists } from './../authentication/authHelpers'
import { getIdentityDb } from './../data/getIdentityDb'
import { getIdentityInstance } from './../identity/getIdentityInstance'
import { FRIEND_AVATAR_DIR } from './../config'

export default function useFetchUser ({ user }) {
  const [ data, setData ] = useState()
  const [ avatar, setAvatar ] = useState()
  const [ avatarUrl, setAvatarUrl ] = useState()
  const [ displayName, setDisplayName ] = useState()
  const [ url, setUrl ] = useState()
  const [ location, setLocation ] = useState()
  const [ bio, setBio ] = useState()
  const [ error, setError ] = useState()
  const [ loading, setLoading ] = useState()
  const [ idReplicated, setIdReplicated ] = useState(false)

  useEffect(() => {
    (async () => {
      if (!identityExists(user)) {
        const query = new IdQuery(user)
        const remoteKey = await query.getRemoteKey('publicKey')
        if (remoteKey) {
          const id = await getIdentityInstance(user, {
            key: remoteKey
          })
          await id.open()
          setIdReplicated(true)
        }  else {
          setError('ID not found')
        }
      }
    })()
  }, [idReplicated])

  useEffect(() => {
    (async () => {
      if (identityExists(user) && idReplicated) {
        const id = await getIdentityInstance(user)
        const userData = await id.getUserData()
        if (userData) {
          const jsonData = JSON.stringify(userData)
          setData(jsonData)
          setAvatar(data.avatar)
          setDisplayName(data.displayName)
          setLocation(data.location)
          setUrl(data.url)
          setBio(data.bio)
          setAvatarUrl(FRIEND_AVATAR_DIR + user + '.gif')
          fs.writeFile(avatarUrl, avatar)
          setLoading(false)
        }  else {
          setError('There was an error retrieving user data from the identity document')
        } 
      }
    })()
  }, [idReplicated])
  
  useEffect(() => {
    if (idReplicated) setIdReplicated(false)
    else setIdReplicated()
  }, [user])

  return {
    data,
    error,
    loading,
    avatar,
    avatarUrl,
    displayName,
    url,
    location,
    bio
  }
}
