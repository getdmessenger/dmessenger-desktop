/**
File: components/FriendAvatar.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component renders a user's avatar, using the useFetchUser hook (hooks/useFetchUser).
*/

import React from 'react'
import { Image, Spinner } from 'react-bootstrap'
import { useFetchUser } from './../hooks/useFetchUser'

export default function FriendAvatar ({ noSpinner, user, size="sm" }) {
  const { loading, error, avatarUrl: url } = useFetchUser(user)

  if (loading && !noSpinner) {
    return <Spinner />
  }
  else if (loading && noSpinner) {
    return <Image src="./../assets/avatars/loadingAvatar.png" roundedCircle />
  }
  else if (error) {
    return <Image src="./../asserts/avatars/noUser.png" roundedCircle />
  }
  else {
    return ( 
      <Image 
        src={url}
        style = {(size === 'sm') ? {width: '25px' , height: 'auto'} : {width: '250px' , height: 'auto'}
        }
        roundedCircle />
    )
  }
}