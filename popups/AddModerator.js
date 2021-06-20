/**
File: popups/AddModerator.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This popup allows a moderator to send a moderator invitation (SMAP) to another user in a public or private room. Uses the new ReplicationDb-based stream service via the controller to initiate the invitation request with another peer.
*/

import React, { useState, useEffect } from 'react'
import { Modal, ListGroup, Button, Spinner, Alert } from 'react-bootstrap'
import { sign } from '@ddatabase/crypto'
import { Identity, ReplicationDb } from './../services'
import { isModerator } from './../helpers/manifestHelpers'
import { useIdentity } from './../hooks/useIdentity'
import { listPublicRoomUsers, getPrivateRoomUserList } from './../helpers/roomHelpers'
import { FriendAvatar } from './../components'

export default function AddModerator (id, show, name, type, moderator, onClose=f => f) {
  const [ list, setList ] = useState()
  const [ loading, setLoading ] = useState(false)
  const [ sent, setSent ] = useState(false)
  
  const { currentIdentity, pin } = useIdentity()
  const identity = new Identity(currentIdentity)
  const streamService = new ReplicationDb(currentIdentity)
  
  useEffect(() => {
    (async () => {
      if (type === 'publicRoom') {
        let userList = await listPublicRoomUsers(name)
        setList(userList)
      } else {
        let userList = await getPrivateRoomUserList(name)
        setList(userList)
      }
    })()
  })

  const handleModSelect = async user => {
    setLoading(true)
    const secret = identity.decryptSecretKey('default', pin)
    const signature = sign(name, secret)
    await streamService.addStream("smap", {
      roomName: name,
      type: type,
      sender: currentIdentity,
      signature: signature,
      intendedReceiver: user
    })
    setSent(true)
    setLoading(false)
  }

  if (isModerator(id, type, name)) {
    return (
      <>
      <Modal show={show} onHide={onClose} backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Moderator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(loading)
             ? <Spinner />
             : (!sent)
                 ? 
                 <>
                 <h3>Choose a moderator from the room's users.</h3>
                   <p>Select the user you would like to make a moderator</p>
                   <ListGroup>
                   {list.map(u => {
                     <ListGroup.Item onClick={handleModSelect(u.user)}>
                       <FriendAvatar user={u.user} size="sm" /> {u.user}
                     </ListGroup.Item>
                   })}
                   </ListGroup>
                   </>

                 : <Alert>The moderator invitation has been sent.</Alert>
          }
        </Modal.Body>
      </Modal>
      </>
    )
  }  else {
    return (
      <Modal show={show} onHide={onClose} backdrop="static" size="lg">
        <Modal.Header closeButton><Modal.Title>Permissions Error!</Modal.Title></Modal.Header>
        <Modal.Body>
          <h3>You are not a moderator!</h3>
          <p>You must be a mod to add other moderators</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={onClose}>Ok</Button>
          </Modal.Footer>
      </Modal>
    )
  }
}
