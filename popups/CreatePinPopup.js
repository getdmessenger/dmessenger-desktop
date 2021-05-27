/**
File: popups/CreatePinPopup.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the popup component used during the pin creation process either during device sync or when a user is creating a PeepsID.
*/

import React from 'react'
import { PinInput } from 'react-pin-input'
import { Modal } from 'react-bootstrap/Modal'

export default function CreatePinPopup ({ onComplete = f => f, show }) {
  return (
    <div>
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
            Create A Pin
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please create a pin below. Your pin must be 6 numbers (0-9).</p>
          <p>This pin will be used when upvoting messages or re-authenticating yourself after your session has timed out.</p>
          <PinInput
            length={6}
            secret={true}
            type="numeric"
            inputMode="number"
            onComplete={onComplete}
          />
        </Modal.Body>
      </Modal>
    </div>
  )
}