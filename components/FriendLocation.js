/**
File: components/FriendLocation.js
Author: Jared Rice Sr. <jared@peepsx.com
Description: This component uses the useFetchUser hook (hooks/useFetchUser.js) to retrieve and return a user's location. The location can be optionally passed to the component if the useFetchUser hook is used at higher levels of the component tree.
*/

import React from 'react'
import { useFetchUser } from './../hooks/useFetchUser'

export default function FriendLocation ({ location, user }) {
  if (!location) {
    const { loading, error, location } = useFetchUser(user)
    
    if (loading) return <p>...</p>
    if (error) return <p>none</p>
    return <p>{location}</p>
  }  else {
    return <p>{location}</p>
  }
}