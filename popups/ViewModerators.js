/**
File: popups/ViewModerators.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This popup allows users of a public or private room to view the room's moderators.
*/

import React, { useState, useEffect } from 'react'
import { Modal, ListGroup } from 'react-bootstrap'
import { listModerators } from './../helpers/manifestHelpers'
import { FriendAvatar } from './../components'

export default function ViewModerators ({ id, show, name, type, onClose = f => f }) {
  const [ list, setList ] = useState()
  
  useEffect(() => {
    (async () => {
      let modList = await listModerators(name, type)
      setList(modList)
    })()
  })

  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>View @{name} Moderators</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup>
          {list.map(u => {
            <ListGroup.Item href={`/profile/${u}`}>
              <FriendAvatar user={u} size="sm" /> {u}
            </ListGroup.Item>
          })}
        </ListGroup>
      </Modal.Body>
    </Modal>
  )
}