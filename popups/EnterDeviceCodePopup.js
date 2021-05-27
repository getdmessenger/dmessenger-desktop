/**
File: popups/EnterDeviceCodePopup.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the popup component used during the identity sync process, when a user is asked to verify a device code, displayed on the device they're syncing with. This uses the same PinInput component as the pin-based popups used throughout the application.
*/

import React from 'react'
import { PinInput } from 'react-pin-input'
import { Modal } from 'react-bootstrap/Modal'

export default function EnterDeviceCodePopup ({ onComplete = f => f, show }) {
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
            Enter Device Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please enter the code displayed on your other device, below, in order to prove that you have access to it.</p>
          <PinInput
            length={8}
            secret={true}
            type="numeric"
            inputMode="number"
            onComplete={onComplete}
          />
        </Modal.Body>
      </Modal>
    </>
  )
}