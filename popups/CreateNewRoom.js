/**
File: popups/CreateNewRoom.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Popup for creating a new public or private room. Handles the entire room creation process from start to finish.
*/

import React, { useState, useEffect } from 'react'
import { Modal, 
             Alert,
             Spinner, 
             FormControl, 
             Form, 
             Image, 
             InputGroup, 
             Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import fs from 'fs'
import path from 'path'
import { getLocalDb, getDb, getPrivateRoomDb } from './../data'
import { RoomService } from './../services'
import { addRoomData, 
             addPublicRoomToId,
             addModerator,
             deriveRoomKey, 
             derivePrivateRoomKey, 
             derivePublicManifestKey, 
             derivePrivateManifestKey } from './../helpers/manifestHelpers'

export default function CreateNewRoom ({ id, show, onClose = f => f }) {
  const [ loading, setLoading ] = useState()
  const [ roomType, setRoomType ] = useState()
  const [ roomName, setRoomName ] = useState()
  const [ displayName, setDisplayName ] = useState()
  const [ roomDescription, setRoomDescription ] = useState()
  const [ roomPolicy, setRoomPolicy ] = useState()
  const [ avatar, setAvatar ] = useState()
  const [ avatarUrl, setAvatarUrl ] = useState()
  const [ error, setError ] = useState()
  
  const navigate = useNavigate()

  const createRoomHandler = event => {
    event.preventDefault()
    if (roomType === 'Public Room') {
      setLoading(true)

      const roomService = new RoomService(roomName)

      // check to see if the room name is already registered on the DHT
      let available = roomService.checkAvailability()

      // if it's available, create room and forward user to newly created room
      if (available) {
        await createRoom(id, 'publicRoom', roomName)
        setLoading(false)
        navigate(`/publicRoom/${roomName}`)
      }

      // if not, generate error
      else {
        return setError('Room name is already taken!')
        setLoading(false)
      }
      
    }
    if (roomType === 'Private Room') {
      setLoading(true)
      await createRoom(id, 'privateRoom', roomName)
      setLoading(false)
      navigate(`/privateRoom/${roomName}`)
    }
  }

  const createRoom = async (id, type, name) => {
    // get access to the local database for the currently logged-in user
    const localDb = await getLocalDb(id)

    // create the database for the room
    const roomDb = (type === 'publicRoom')
                               ? getDb(name)
                               : getPrivateRoomDb(name)

    // register public room name on the DHT, along with its manifest key
    if (type === 'publicRoom') {
      const roomService = new RoomService(name)
      roomService.register(derivePublicManifestKey(name))
    }

    // add the network configuration for this new room, to the user's local database
    // the Controller is constantly listening for new swarm configs and should immediately
    // start announcing and looking up peers for this configuration

    await localDb.addSwarmConfig((type === 'publicRoom') ? 'publicRoom' : 'privateRoom', {
      lookup: true,
      announce: true,
      discoveryKey: (type === 'publicRoom') ? deriveRoomKey(name) : roomDb.key,
      roomName: name
    })

    // create the manifest database for this room and add the initial room data
    await addRoomData(name, type, id, {
      roomName: name,
      avatar, avatar,
      roomDescription: roomDescription,
      roomPolicy: roomPolicy
    })

    // add creator as first moderator in manifest
    await addModerator(name, type, {
      id: id,
      moderator: id
    })

    // save the manifest swarm config in the logged-in user's local db.
    await localDb.addSwarmConfig((type === 'publicRoom') ? 'publicManifest' : 'privateManifest', {
      lookup: true,
      announce: true,
      discoveryKey: (type === 'publicRoom') ? derivePublicManifestKey(name) : derivePrivateManifestKey(name),
      roomName: name
    })

    // If it's a public room, add to the user's identity document.
    // If it's a private room, add the private room to the logged-in user's local database.

    (type === 'publicRoom')
      ? await addPublicRoomToId(id, {
          roomName: name,
          isCreator: true,
          roomKey: deriveRoomKey(name)
        })
     :  await localDb.addPrivateRoom(name, true)

  }

  const handlePhotoUpload = event => {
    const file = event.target.files[0]
    const data = fs.readFileSync(file)
    setAvatarUrl(file)
    setAvatar(data)
  }

  if (loading === true) {
    return (
      <center><Spinner /></center>
    )
  }  else {
    return (
        <>
      <input accept="image/gif" type="file"
        onChange={handlePhotoUpload}
        style={{display: 'none'}}
        id="photo-upload" />

      <Modal show={show}  onHide={onClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Create New Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           // TODO FIX THIS
          {(error) ? <Alert variant="danger"><p>Error: {error}</p></Alert> : null}

          <h3>Choose room type:</h3>
          <p>Please choose the type of room you would like to create.</p>
          <Form onSubmit={createRoomHandler}>
            <Form.Control as="select" size="lg" onChange={event => setRoomType(event.target.value)}>
              <option>Public Room</option>
              <option>Private Room</option>
            </Form.Control>
            <InputGroup className="mb-3">
              <InputGroup.Prepend>
                <InputGroup.Text>@</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl 
                placeholder="Enter a room name" 
                onChange={event => setRoomName(event.targe.value)} 
                size="lg" />
            </InputGroup>
            <FormControl 
              placeholder="Choose display name..." 
              onChange={event => setDisplayName(event.target.value)}
              size="lg"
            />
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter a room description"
              onChange={event => setRoomDescription(event.target.value)}
            />
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter a room policy"
              onChange={event => setRoomPolicy(event.target.value)}
            />
            <span>
              {(avatarUrl)
                ? <Image style={{width:'150px', height: 'auto'}} src={avatarUrl} />
                : null
              }
              <Form.File.Label htmlFor="photo-upload">
                <Button variant="primary" size="sm">Upload Avatar</Button>
              </Form.File.Label>
            </span>
            <Button type="submit" variant="success" onClick={createRoomHandler}>Create Room</Button>
          </Form>
        </Modal.Body>
      </Modal>
      </>
    )
  }
}