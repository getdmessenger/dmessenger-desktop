/**
File: components/UserCard.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the User card component, which is used to display a particular user in search results, when searching for a user. It shows the user's display name, avatar, abbreviated version of their bio and a follow button. These cards can be shown in multiples by simply referencing the username in the UserCard component, like so:

<UserCard user={jared} />
<UserCard user={shikhar} />

Throughout dMessenger, it is used dynamically to list as many users as our needed to satisfy a particular search keyword. The search for @jared could render many users like @jared2, @jaredrice, etc. So this card could be used to dynamically show as many users as are needed by the results page.

*/

import React from 'react'
import { Card } from 'react-bootstrap/Card'
import { FriendAvatar,
             FriendBio,
             FriendDisplayName,
             FriendLocation,
             FollowButton } from './'
import { useFetchUser } from './../hooks/useFetchUser'

export default function UserCard ({ user, data }) {
    
    
  if (!data) {
    const { loading, error, data, avatarUrl } = useFetchUser(user)
  }

  if (!error) {
    return (
      <Card style={{width:'18rem'}}>
        { (loading)
            ? <Spinner />
            : <Card.Body>
                 <FriendAvatar
                     url= {(avatarUrl) ? {avatarUrl} : {data.avatarUrl}} />
                 <Card.Title>
                   <FriendDisplayName
                      name={data.displayName} />
                 </Card.Title>
                 <Card.Subtitle
                     className="mb-2 text-muted">@{user}
                 </Card.Subtitle>
                 <Card.Subtitle
                     className="mb-2">{data.location}
                 </Card.Subtitle>
                 <Card.Text>
                   <FriendBio
                      bio={data.bio} />
                </Card.Text>
                <FollowButton user={user} />
              </Card.Body>
        }
      </Card>
    )
  }  else {
    return
  }
}