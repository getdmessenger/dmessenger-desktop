/**
File: popups/LeaveRoom.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: A popup that allows a user to leave a public or private room.
*/

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isModerator, removeModerator } from './../helpers/manifestHelpers'
import { leavePublicRoom, leavePrivateRoom } from './../helpers/roomHelpers'
import { getPrivateRoomDb } from './../data/getPrivateRoomDb'

export default function LeaveRoom ({ id, name, type, show, onClose = f => f }) {

  const handleLeaveRoom  = async () => {
    if (isModerator( id, type, name)) {
      await removeModerator(name, type, {
        moderator: id,
        currentModerator: id
      })
    }
    if (type === 'publicRoom') await leavePublicRoom(id, name)
    if (type === 'privateRoom') {
      let db = getPrivateRoomDb(name)
      let key = db.discoveryKey
      await leavePrivateRoom(id, key, name)
    }
    navigate('/home')
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Leave Room</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(error) ? <Alert variant="danger">{error}</Alert> : null }
        <p>Are you sure you want to leave @{name}?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" size="lg" onClick={handleLeaveRoom}>Yes, I'm leaving!</Button>
        <Button variant="primary" size="lg" onClick={onClose}>No, I'm staying!</Button>
      </Modal.Footer>
    </Modal>
  )
}
