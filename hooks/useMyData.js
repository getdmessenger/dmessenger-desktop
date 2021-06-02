/**
File: hooks/useMyData.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This hook is used to retrieve the logged-in user's data from their local identity document. This data includes their avatar, displayName, url, location and bio.
*/

import React, { useState, useEffect } from 'react'
import path from 'path'
import { getIdentityInstance } from './../identity/getIdentityInstance'
import { FRIEND_AVATAR_DIR } from './../config'

export default function useMyData ({ me }) {
  const [ data, setData ] = useState()
  const [ avatar, setAvatar ] = useState()
  const [ displayName, setDisplayName ] = useState()
  const [ url, setUrl ] = useState()
  const [ location, setLocation ] = useState()
  const [ bio, setBio ] = useState()
  const [ error, setError ] = useState()
  const [ loading, setLoading ] = useState()

  useEffect(() => {
    setLoading(true)
    const id = getIdentityInstance(me)
    const userData = await id.getUserData()
    if (userData) {
      const jsonData = JSON.stringify(userData)
      setData(jsonData)
      setAvatar(data.avatar)
      setDisplayName(data.displayName)
      setLocation(data.location)
      setUrl(data.url)
      setBio(data.bio)
      setLoading(false)
    }  else {
      setError('Your data was not found')
    }
  }, [me])

  return {
    data,
    error,
    loading,
    avatar,
    displayName,
    url,
    location,
    bio
  }
}