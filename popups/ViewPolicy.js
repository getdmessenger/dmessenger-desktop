/**
File: popups/ViewPolicy.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This popup allows a user to view the room policy for a public room.
*/

import React, { useState, useEffect } from 'react'
import { Modal, Button, Spinner } from 'react-bootstrap'
import { useFetchRoom } from './../hooks'

export default function ViewPolicy ({ id, show, name, onClose=f => f }) {
  const { error, loading, roomPolicy } = useFetchRoom(name)

  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>View @{name} Policy</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(loading)
           ? <Spinner />
           :
           <div>
           <h3>Room Policy For @{name}</h3>
             <p>{roomPolicy}</p>
             </div>
        }
        {(error)
           ? <p>{error}</p>
           : null
        }
      </Modal.Body>
    </Modal>
  )
}