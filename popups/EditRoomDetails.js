/**
File: popups/EditRoomDetails.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: A popup used to allow a moderator to edit the details related to a public or private room.
*/

import React, { useState, useEffect } from 'react'
import fs from 'fs'
import path from 'path'
import { useFetchRoom } from './../hooks'
import { addRoomData } from './../helpers/roomHelpers'
import { isModerator } from './../helpers/manifestHelpers'

export default function EditRoomDetails ({ id, name, type, show, onClose=f => f }) {
  const [ mode, setMode ] = useState('start')
  const [ roomDescription, setRoomDescription ] = useState()
  const [ roomPolicy, setRoomPolicy ] = useState()
  const [ avatar, setAvatar ] = useState()
  const [ avatarUrl, setAvatarUrl ] = useState()

  const { loading, error, data, avatar: roomAvatar, avatarUrl: roomAvatarUrl } = useFetchRoom(name, type)

  useEffect(() => {
    setRoomDescription(data.roomDescription)
    setAvatarUrl(roomAvatarUrl)
    setAvatar(roomAvatar)
    setRoomPolicy(data.roomPolicy)
  })

  const handlePhotoUpload = event => {
    const file = event.target.files[0]
    const data = fs.readFileSync(file)
    setAvatarUrl(file)
    setAvatar(data)
  }

  const editRoomHandler = async () => {
    await addRoomData(name, type, id ,{
      roomName: name,
      avatar: avatar,
      roomDescription: roomDescription,
      roomPolicy: roomPolicy
    })
    setMode('edited')
  }
  
  if (isModerator(id, type, name)) {
    return (
      <Modal show={show} onHide={onClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Edit @{name} Details</Modal.Title>
       </Modal.Header>
       <Modal.Body>
         {(mode === 'start')
            ?  
            <>
            <h4>Update room description:</h4>
               <Form.Control 
                 as="textarea" 
                 rows={3} 
                 value={roomDescription} 
                 onChange={event => setRoomDescription(event.target.value)} 
               />
               <h4>Update room policy:</h4>
               <Form.Control
                 as="textarea"
                 rows={3}
                 value={roomPolicy}
                 onChange={event => setRoomPolicy(event.target.value)}
               />
               <span>
                 {(avatarUrl)
                   ? <Image style={{width: '150px', height: 'auto'}} src={avatarUrl} />
                   : null
                 }
                 <Form.File.Label htmlFor="photo-upload">
                   // TODO handle button
                   <Button variant="primary" size="sm">Edit Avatar</Button>
                 </Form.File.Label>
               </span>
               <Button size="lg" variant="success" onClick={editRoomHandler}>Edit Room Details</Button>
               </>
            : <Alert>
                {name} details were updated!
              </Alert>
         }
       </Modal.Body>
      </Modal>
    )
  }  else {
    return (
      <Modal show={show} onHide={onClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Access Denied!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You must be a moderator to edit this room's details</p>
        </Modal.Body>
      </Modal>
    ) 
  }
}
