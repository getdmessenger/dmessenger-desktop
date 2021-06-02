/**
File: components/FriendDisplayName.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This uses the useFetchUser hook (hooks/useFetchUser.js) to retrieve a specific user's display name from their identity document. Optionally, the useFetchUser hook could be used at a higher level of the component tree and the {name} prop can be passed to this component directly.
*/

import React from 'react'
import { useFetchUser } from './../hooks/useFetchUser'

export default function FriendDisplayName ({ name, user }) {
  if (!name) {
    const { loading, error, displayName } = useFetchUser(user)

    if (loading) return <p>...</p>
    if (error) return <p>NoUser</p>
    return <p>{displayName}</p>
  }  else {
    return (
      <p>{name}</p>
    )
  }
}
