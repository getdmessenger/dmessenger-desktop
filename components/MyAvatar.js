/**
File: components/MyAvatar.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component renders the logged-in user's avatar.
*/

import path from 'path'
import React from 'react'
import { Image } from 'react-bootstrap/Image'
import { FRIEND_AVATAR_DIR } from './../config'

export default function MyAvatar ({ me }) {
  const avatar = path.join(FRIEND_AVATAR_DIR, me + '.gif')

  return (
    <Image
      src={avatar}
      roundedCircle
    />
  )
}