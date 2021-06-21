/**
File: components/RoomCard.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This displays the details related to a room, along with a join/leave button (depending on current membership status).
*/

import React, { useState, useEffect } from 'react'
import { Card, Spinner, Button } from 'react-bootstrap'
import { sign } from '@ddatabase/crypto'
import {  useFetchRoom, useIdentity } from './../hooks'
import { isRoomMember, 
             listPublicRoomUsers, 
             joinPublicRoom, 
             leavePublicRoom } from './../helpers/roomHelpers'
import { Identity } from './../services'
import { RoomAvatar } from './'

export default function RoomCard ({ roomName }) {
  const [ count, setCount ] = useState(0)
  const [ joined, setJoined ] = useState()
  const [ abbDescription, setAbbDescription ] = useState()

  const { loading, error, data } = useFetchRoom(roomName, 'publicRoom')
  const { currentIdentity, pin } = useIdentity()
  const identity = new Identity(currentIdentity)

  useEffect(() => {
    (async () => {
      let member = await isRoomMember(user, roomName, 'publicRoom')
      setJoined(member)
    })()
  })

  useEffect(() => {
    let abb = data.roomDescription.substring(0, 31)
    setAbbDescription(abb + '...')
  }, [data])
 
  const joinRoom = async () => {
    let secret = await identity.decryptSecretKey('default', pin)
    let signature = sign(currentIdentity, secret)

    await joinPublicRoom(currentIdentity, {
      swarm: {
        lookup: true,
        announce: true,
      },
      roomName: roomName,
      signature: signature,
    })

   setJoined(true)
  }

  const leaveRoom = async () => {
    let secret = await identity.decryptSecretKey('default', pin)
    let signature = sign(currentIdentity, secret)
    await leavePublicRoom(currentIdentity, roomName, signature)
    setJoined(false)
  }

  useEffect(() => {
    (async () => {
      let pubUsers = await listPublicRoomUsers(roomName)
      setCount(pubUsers.length - 1)
    })()
  })

  return (
    <Card style={{width: '18rem'}}>
      <Card.Body>
        {(loading)
          ? <Spinner />
          : null
        }
        {(error)
          ? <p>{error}</p>
          : null
        }
        {(data)
          ? 
          <>
          <Card.Title>
               <RoomAvatar type="publicRoom" room={roomName} size="sm" />
               @{roomName}
            </Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{count} members</Card.Subtitle>
            <Card.Text>{abbDescription}</Card.Text>
            <Button
              variant={(joined) ? "success" : "primary"}
              size="sm"
              onClick={(joined) ? {leaveRoom} : {joinRoom}}
              block>
              {(joined) ? "Leave Room" : "Join Room" }
            </Button>
            </>
          : null
        }
      </Card.Body>
    </Card>
  )
}