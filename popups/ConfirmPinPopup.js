/**
File: popups/ConfirmPinPopup.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This modal displays a pin input, that is used in the pin confirmation process.
*/

import React from 'react'
import { Modal } from 'react-bootstrap/Modal'
import { PinInput } from 'react-pin-input'

export default function ConfirmPinPopup ({ onComplete = f => f, onClick = f => f, show }) {
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
             Confirm Your Pin
           </Modal.Title>
         </Modal.Header>
         <Modal.Body>
           <PinInput
             length={6}
             secret={true}
             type="numeric"
             inputMode="number"
             onComplete={onComplete}
            />
         </Modal.Body>
         <Modal.Footer>
           <Button variant="danger" onClick={onClick}>Abort Sync</Button>
         </Modal.Footer>
       </Modal>
    </>
  )
}