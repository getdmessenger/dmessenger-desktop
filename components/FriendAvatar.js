/**
File: components/FriendAvatar.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component displays the avatar of a remote user. It either retrieves the avatarUrl using the useFetchUser hook (hooks/useFetchUser.js) or the url can be passed to the component directly.
*/

import React from 'react'
import { Image } from 'react-bootstrap/Image'
import { Spinner } from 'react-bootstrap/Spinner'
import { useFetchUser } from './../hooks/useFetchUser'

export default function FriendAvatar ({ noSpinner, user, url, style }) {
  if (!url) {
    const { loading, error, avatarUrl: url } = useFetchUser(user)

    if (loading && noSpinner) return <Spinner/>
    else if (loading) <Image src="./../assets/avatars/loadingAvatar.png" style={style} roundedCircle />
    else if (error) <Image src="./../assets/avatars/noUser.png" style={style} roundedCircle />
    else return <Image src={url} style={style} roundedCircle />
  }  else {
    return <Image src={url} style={style} roundedCircle />
  }
}