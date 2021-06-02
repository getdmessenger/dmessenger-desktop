/**
File: components/FriendBio.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component uses the useFetchUser hook (hooks/useFetchUser.js) to retrieve and return a remote user's bio from their identity document. You can optionally pass the bio directly to this component, if the useFetchUser hook is used at a higher level of the component tree.
*/

import React from 'react'
import { useFetchUser } from './../hooks/useFetchUser'

export default function FriendBio ({ bio, user }) {
  if (!bio) {
    const { loading, error, bio } = useFetchUser(user)
    if (loading) return <p>...</p>
    if (error) return <p>No bio available.</p>
    else return <p>{bio}</p>
  } else {
    return <p>{bio}</p>
  }
}