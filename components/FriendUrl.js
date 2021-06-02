/**
File: components/FriendUrl.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component uses the useFetchUser hook (hooks/useFetchUser.js) to retrieve and return a user's URL from their identity document. The url can be optionally passed to the component, if the useFetchUser hook is used at a higher level of the component tree.
*/

import React from 'react'
import { Button } from 'react-bootstrap/Button'
import { useFetchUser } from './../hooks/useFetchUser'

// TODO: get rid of the repetitive code here

export default function FriendUrl ({ isLink=false, url, user }) {
  if (!url) {
    if (loading) return <p>...</p>
    if (error) return <p>No url found.</p>
    return (
      <Button
      variant = {(isLink) ? variant="link" : variant="button"}
        href={url}
        size="sm"
      >
        Website
      </Button>
    )
  }  else {
    return (
      <Button
       variant ={(isLink) ? variant="link" : variant="button"}
        href={url}
        size="sm"
      >
        Website
      </Button>
    )
  }
}