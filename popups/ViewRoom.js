/**
File: popups/ViewRoom.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This popup allows a user to view details about a specific public or private room.
*/

import React, { useState, useEffect } from 'react'
import { Modal, Button, Spinner, ListGroup } from 'react-bootstrap'
import { useFetchRoom } from './../hooks'
import { listPublicRoomUsers, getPrivateRoomUserList } from './../helpers/roomHelpers'
import { listModerators } from './../helpers/manifestHelpers'
import { RoomAvatar } from './../components'

export default function ViewRoom ( id, show, name, type, onClose= f => f ) {
  const [ list, setList ] = useState()
  const [ modList, setModList ] = useState()
  const { error, loading, avatar, avatarUrl, roomDescription, roomPolicy } = useFetchRoom(name)
  
  useEffect(() => {
    (async () => {
      if (type === "publicRoom") {
        let roomUsers = await listPublicRoomUsers(name)
        setList(roomUsers)
      }  else {
        let roomUsers = await getPrivateRoomUserList(name)
        setList(roomUsers)
      }
    })()
  })

  useEffect(() => {
    (async () => {
      let moderatorList = await listModerators(name, type)
      setModList(moderatorList)
    })()
  })
  
  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>@{name} Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(loading)
           ? <Spinner />
           : (type === 'publicRoom' || type === 'privateRoom')
               ?
               <>
                <p><strong>Room Name:</strong> {name}</p>
                 (type === 'publicRoom')
                     ?  
                     <>
                     <p><strong>Room Description:</strong></p>
                        <p>{roomDescription}</p>
                        </>
                     :  null
                
                 <p><strong>Room Users</strong></p>
                 <ListGroup>
                   {list.map(x => {
                     <ListGroup.Item href={`/profile/${x.user}`}>
                       <FriendAvatar user={x.user} size="sm" /> {x.user}
                     </ListGroup.Item>
                   })}
                 </ListGroup>
                 <p><strong>Room Moderators</strong></p>
                 <ListGroup>
                   {modList.map(x => {
                     <ListGroup.Item href={`/profile/${x.user}`}>
                       <FriendAvatar user={x.user} size="sm" /> {x.user}
                     </ListGroup.Item>
                   })}
                 </ListGroup>
                 </>
               : 
        (error)
          ? <p>{error}</p>
          : null
        }
      </Modal.Body>
    </Modal>
   )
}