/**
File: components/FollowButton.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is a button that allows a user to follow/unfollow a user. It is displayed in a user's profile, within a UserCard and in other places throughout the application, when a particular user's data is displayed. If a logged-in user is already following the remote user, this data is retrieved from the useFollow hook (hooks/useFollow.js) and the button uses the success variant and displays "Following" with a checkmark. If the logged-in user isn't following the remote user, the button uses the "primary" variant and displays "Follow". Upon clicking the button, if the logged-in user is already following the remote user, then the remote user will be unfollowed, and if the user isn't following the user, then upon clicking the button, they will begin following the user. This functionality is made possible by the followUser() and unfollowUser() functions that are imported from the useFollow hook.
*/

import React from 'react'
import { FaCheckmark } from 'react-icons/fa' 
import { Spinner } from 'react-bootstrap/Spinner'
import { Button } from 'react-bootstrap/Button'
import { useFollow } from './../hooks/useFollow'

export default function FollowButton ({ user }) {
  const { loading, following, followUser, unfollowUser } = useFollow(user)
  return (
    <Button
      variant = {(following) ? variant="success" : variant="primary"}
      size="lg"
      onClick = {(following) ? onClick={unfollowUser} : onClick={followUser}}
      disabled = {(loading) ? disabled : null}
      block>
        {(loading) ? <Spinner /> : null}
        {(following) ? <FaCheckmark /> : 'Follow'}
    </Button>
  )
}