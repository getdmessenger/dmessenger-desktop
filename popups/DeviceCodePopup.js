/**
File: popups/DeviceCodePopup.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This modal is used to display a device code on the master device in an identity exchange. 
*/

import React from 'react'
import { Modal } from 'react-bootstrap/Modal'
import { useIdentity } from './../hooks/useIdentity'

export default function DeviceCodePopup ( { onClick = f => f, show } ) {
  const { deviceCode } = useIdentity()
  return (
    <>
      <Modal
        size="xl"
        show={show}
        animation={true}
        backdrop="static"
        centered={true}
        enforceFocus={true}
        restoreFocus={true}
      >
        <Modal.Header>
          <Modal.Title>
            Your Device Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Enter this 8-digit device code on the device you're attempting to authorize.</p>
          <h1><strong>{deviceCode}</strong></h1>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={onClick}>Abort Sync</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
