/**
File: components/ViewFriend.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component renders the main view of dMessenger's /friends/ page. It is used for displaying an actual friend's page. 
*/

import React, { useState, useEffect } from 'react'
import { Container, Row, Spinner } from 'react-bootstrap'
import fs from 'fs'
import path from 'path'
import { useFetchUser } from './../hooks'
import { listPublicRooms } from './../helpers/roomHelpers'
import { roomBox, viewFriendContainer, userBox } from './../jss/components/ViewFriend'
import { BASE_DIRECTORY } from './../config'
import { AddFriend } from './../popups'
import { FriendAvatar, RoomCard, FollowButton, DirectMessageButton } from './'

export default function ViewFriend ({ friend, noSelect }) {
  const [ pubRooms, setPubRooms ] = useState()
  const [ bkgImagePath, setBkgImagePath ] = useState()
  const [ showAdd, setShowAdd ] = useState(false)
  
  const { displayName, location, bkgImage, bio, loading, error } = useFetchUser(friend)

  useEffect(() => {
    await listPublicRooms(friend)
    .then(f => setPubRooms(f))
  })
  
  useEffect(() => {
    if (!loading) {
      let pathToBkgImage = path.join(BASE_DIRECTORY, 'images', 'bkg', friend + '.gif')
      fs.writeFile(pathToBkgImage, bkgImage, (err) => {
        if (err) return
      })
      setBkgImagePath(pathToBkgImage)
    }
  }, [loading])

  if (!noSelect) {
    return (
        <>
      <AddFriend show={showAdd} onClose={() => setShowAdd(false)} />
      <Container style={viewFriendContainer} fluid>
        <Row style={{ width: '100%', height: '40%', backgroundImage: bkgImagePath}}>
          <div style={userBox} className="center-block justify-content-md-center">
            <FriendAvatar user={friend} size="lg" />
            <span><h3>{displayName}</h3></span>
            <span><h5 className="text-muted">@{username}</h5></span>
            <span>{location}</span>
            <span>{bio}</span>
            <span>
              <DirectMessageButton user={username} />
              <FollowButton user={username} />
            </span>
          </div>
        </Row>
        <Row style={{width: '100%'}}>
          <div style={roomBox} className="justify-content-md-left">
            <span>
              {pubRooms.map(r => {
                <RoomCard name={r.name} />
              })}
            </span>
          </div>
        </Row>
      </Container>
      </>
    )
  } else {
      <>
    <AddFriend show={showAdd}  onClose={() => setShowAdd(false)} />
    <Container style={viewFriendContainer} fluid>
      <Row style={{margintop:'50%'}} className="center-block justify-content-md-center">
        <h3>Please select a friend on the left sidebar or add some friends.</h3>
        <Button variant="primary" size="lg" onClick={setShowAdd(true)}>Add A Friend</Button>
      </Row>
    </Container>
    </>
  }
}
