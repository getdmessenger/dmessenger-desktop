/**
File: hooks/useFollow.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This hook is used to retrieve the following status for a remote user. It is used by the FollowButton (components/FollowButton.js).
*/

import React, { useState, useEffect } from 'react'
import { DWebIdentity } from '@dwebid/core'
import { IdQuery } from '@dwebid/query'
import { isFollowingUser } from './../helpers/friendHelpers'

export default function useFollow ({ user }) {
  const [ loading, setLoading ] = useState(true)
  const [ following, setFollowStatus ] = useState()

  const id = new DWebIdentity(user)
  
  useEffect(() => {
    setLoading(true)
    const status = await isFollowingUser(user)
    if (status) setFollowingStatus(true)
    else setFollowingStatus(false)
    setLoading(false)
  }, [user])

  const followUser = () => {
    if (following) return
    setLoading(true)
    const query = new IdQuery(user)
    const remoteKey = await query.getRemoteKey('publicKey')
    if (remoteKey) {
      await id.addRemoteUser({
        username: user,
        didKey: remoteUser
      })
      setFollowingStatus(true)
      setLoading(false)
    }
  }

  const unfollowUser = () => {
    if (!following) return
    setLoading(true)
    await id.removeRemoteUser(user)
    setLoading(false)
  }

  return {
    loading,
    following,
    followUser,
    unfollowUser
  }
}