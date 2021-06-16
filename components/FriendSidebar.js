/**
File: components/FriendSidebar.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component renders the sidebar on dMessenger's /friends/ pages.
*/

import React, { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { Identity } from './../services/Identity'
import { useFetchUser } from './../hooks'
import { AddFriend } from './../popups/AddFriend'
import { friendSidebar } from './../jss/components/FriendSidebar'
import { SidebarHeader, FriendSidebarItem } from './'

export default function FriendSidebar ({}) {
  const [ list, setList ] = useState()
  const [ friends, setFriends ] = useState()
  const [ showAdd, setShowAdd ] = useState()
  
  let id = new Identity(currentIdentity)
  let loc = useLocation()

  const isActiveFriend = friend => {
    if (loc.pathname === `/friends/${friend}`) return true
    else return false
  }

  useEffect(() => {
    (async () => {
      await id.getRemoteUsers()
      .then(ls => setList(ls))
    })()
  })

  useEffect(() => {
    list.forEach(f => {
      let user = f.username
      let { data, displayName, location } = useFetchUser(user)
      let friend = {
        username: user,
        data: data,
        displayName: displayName,
        location: location
      }
      setFriends(...friends, friend)
    })
  }, [list])

  return (
      <>
    <AddFriend show={showAdd} onClose={() => setShowAdd(false)} />
    <Container style={friendSidebar} fluid>
      <SidebarHeader />
      <Button variant="primary" size="large" onClick={() => setShowAdd(true)} block>Add Friend</Button>
      {friends.map(f => {
          <FriendSidebarItem
            username={f.username}
            displayName={f.displayName}
            location={f.location}
            isActive={(isActiveFriend(f.username)) ? true : false}
           />
        })}
    </Container>
    </>
  )
}