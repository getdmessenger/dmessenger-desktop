/**
File: components/MyAvatar.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component renders a logged-in user's avatar. This is used within the SidebarHeader within the UserCard
*/

import React from 'react'
import path from 'path'
import { Image } from 'react-bootstrap'
import { FRIEND_AVATAR_DIR } from './../config'

export default function MyAvatar ({ me, size="sm" }) {
  const avatar = path.join(FRIEND_AVATAR_DIR + me + '.gif')

  return (
    <Image
      src={avatar}
      style = {(size === "sm") ? style={width:'25px', height: 'auto'} : style={width:'250px', height: 'auto'}}
      roundedCircle
    />
  )
}