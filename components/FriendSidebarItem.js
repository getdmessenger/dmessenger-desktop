/**
File: components/FriendSidebarItem.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component renders an individual item, within the list of friends, found on the /friends/ page's sidebar.
*/

import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import { FriendAvatar } from './'

export default function FriendSidebarItem ({ username, displayName, location, isActive }) {
  return (
    <Link to={`/friends/${username}`}>
      <Card
        isActive = {(isActive) ? bg="dark" : bg="light"} 
        style={friendSidebarItem}>
        <Card.Header>@{username}</Card.Header>
        <Card.Body>
          <Card.Title><FriendAvatar size="sm" user={username} /> {displayName}</Card.Title>
          <Card.Text>{location}</Card.Text>
        </Card.Body>
      </Card>
    </Link>
  )
}