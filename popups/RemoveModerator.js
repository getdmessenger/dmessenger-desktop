/**
File: popups/RemoveModerator.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This popup allows a moderator to remove another user's moderator privileges within a public or private room.
*/

import React, { useState, useEffect } from 'react'
import { Modal, ListGroup, Button, Spinner } from 'react-bootstrap'
import { isModerator, listModerators, removeModerator } from './../helpers/roomHelpers'
import { useIdentity } from './../hooks'
import { FriendAvatar } from './../components'

export default function RemoveModerator (id, show, name, type, moderator, onClose= f => f) {
  const [ list, setList ] = useState()
  const [ removed, setRemoved ] = useState(false)

  const { currentIdentity } = useIdentity()

  useEffect(() => {
    (async () => {
      let modList = await listModerators(name, type)
      setList(modList)
    })()
  })

  const handleModRemove = async user => {
    await removeModerator(name, type, user)
    setRemoved(true)
  }

  if (isModerator(id, type, name)) {
    return (
      <Modal show={show} onHide={onClose} backdrop="static" size="lg">
        <Modal.Header closeButton><Modal.Title>Remove Moderator</Modal.Title></Modal.Header>
        <Modal.Body>
          {(!removed)
             ?
             <div> 
             <h3>Choose a moderator to remove.</h3>
               <p>Select a moderator you wish to remove</p>
               <ListGroup>
                 {list.map(u => {
                   <ListGroup.Item onClick={handleModRemove(u)}>
                     <FriendAvatar user={u} size="sm" /> {u.user}
                   </ListGroup.Item>
                 })}
               </ListGroup>
               </div>
            :  <Alert variant="success">
                 Moderator was successfully removed!
               </Alert>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}