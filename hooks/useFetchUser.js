/**
File: hooks/useFetchUser.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This hook is used to fetch user data from a user's identity document and exports it to several state variables. This hook is used to derive user information throughout the application. If a user's identity document is not local, it first replicates the document and then retrieves a user's actual data from it (avatar, display name, location, url and bio).
*/

import React, { useState, useEffect } from 'react'
import fs from 'fs'
import path from 'path'
import { IdQuery } from '@dwebid/query'
import { identityExists } from './../authentication/authHelpers'
import { getIdentityDb } from './../data/getIdentityDb'
import { getIdentityInstance } from './../identity/getIdentityInstance'
import { FRIEND_AVATAR_DIR } from './../config'

export default function useFetchUser ({user}) {
  const [ data, setData ] = useState()
  const [ avatar, setAvatar ] = useState()
  const [ avatarUrl, setAvatarUrl ] = useState()
  const [ displayName, setDisplayName ] = useState()
  const [ url, setUrl ] = useState()
  const [ location, setLocation ] = useState()
  const [ bio, setBio ] = useState()
  const [ error, setError ] = useState()
  const [ loading, setLoading ] = useState(true)
  const [ idReplicated, setIdReplicated ] = useState(false)

  useEffect(() => {
    if (idReplicated) setIdReplicated(false)
    else setIdReplicated()
  }, [user])

  useEffect(() => {
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
        setError('ID not found.')
      }
    }
  }, [idReplicated])

  useEffect(() => {
    if (identityExists(user)) {
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
        setError('There was an error retrieving user data from the identity document.')
      }
    }
  }, [idReplicated])

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