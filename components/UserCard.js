/**
File: components/UserCard.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component renders a card that displays a specific user's avatar, bio, display name, location and a follow button. This is used within search results, when a user is found, within the AddFriend popup and the Search page (/pages/search).
*/

import React from 'react'
import { Card } from 'react-bootstrap'
import { useFetchUser } from './../hooks'
import { FriendAvatar, FriendBio, FriendDisplayName, FriendLocation, FriendButton } from './'

export default function UserCard ({ user }) {
  const { loading, error, data, avatarUrl } = useFetchUser(user)

  if (!error) {
    return (
      <Card style={{width='18rem'}}>
        <Card.Body className="justify-content-md-center">
          {(loading)
            ? <Spinner />
            :  
                <div>
                <FriendAvatar url={avatarUrl} />
                <Card.Title><FriendDisplayName name={data.displayName} /></Card.Title>
                <Card.Subtitle className="mb-2 text-muted">@{user}</Card.Subtitle>
                <Card.Subtitle className="mb-2">{data.location}</Card.Subtitle>
                <Card.Text><FriendBio bio={data.bio} /></Card.Text>
                <FollowButton user={user} /> 
                </div>
            
          }
        </Card.Body>
      </Card>
    )
  }  else {
    return (
      <Card style={{width='18rem'}}>
        <Card.Body><h3>An error has occurred.</h3></Card.Body>
      </Card>
    )
  }
}
