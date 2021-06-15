/**
File: components/MessageDropdown.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: The dropdown menu found on each Message card (components/Message.js). This displays options to the creator of a message (edit/delete), moderators of a room (block user/delete message) and to all users (view profile, is message encrypted, etc.).
*/

import React, { useState, useEffect } from 'react'
import { DropdownButton, Modal } from 'react-bootstrap'
import { FAInfo } from 'react-icons/fa'
import { useMessenger, useIdentity } from './../hooks'
import { deleteMessage } from './../data/deleteMessage'
import { deleteMessage, modDeleteMessage, blockUser } from './../helpers/manifestHelpers'

export default function MessageDropdown ({ name, type, message, isReply, isReplyTo, timestamp, from, id }) {
  const [ showDeleteModal, setShowDeleteModal ] = useState()
  const [ showBlockModal, setShowBlockModal ] = useState()
  const [ showModDeleteModal, setShowModDeleteModal ] = useState()
  const [ showIeModal, setShowIeModal ] = useState()

  const { currentIdentity, pin } = useIdentity()
  const { setEditing } = useMessenger()

  // By creating `editing` state, the input form within the SendMessage component should change
  // to reflect that messageId is being edited by the user.

  const handleEdit = () => {
    setEditing({
      name: name,
      messageId: id,
      message: message,
      isReply: isReply,
      isReplyTo: isReplyTo,
      timestamp: timestamp     
    })
  }

  const handleDelete = async () => {
    await deleteMessage(type, id, {
      name: name,
      username: from,
      oldTimestamp: timestamp,
      encryptSeed: null,
      pin: pin
    })
    setShowDeleteModal(false)
  }

  const handleBlock = async () => {
    await blockUser(from, type, name, currentIdentity)
    setShowBlockModal(false)
  }

  const handleModDelete = async () => {
    await modDeleteMessage(currentIdentity, type, name, from, id)
    setShowModDeleteModal(false)
  }
  
  return (
      <>
    <Modal show={showDeleteModal} size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Delete message</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this message?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary-outline" onClick={() => setShowDeleteModal(false)}>No</Button>
        <Button variant="danger" onClick={handleDelete}>Yes</Button>
      </Modal.Footer>
    </Modal>

     <Modal show={showBlockModal} size="sm">
       <Modal.Header>
         <Modal.Title>Block {from}</Modal.Title>
       </Modal.Header>
       <Modal.Body>
         <p>Are you sure you would like to block this user from participating in {name}? </p>
       </Modal.Body>
       <Modal.Footer>
         <Button variant="secondary-outline" onClick={() => setShowBlockModal(false)}>No</Button>
         <Button variant="danger" onClick={handleBlock}>Yes</Button>
       </Modal.Footer>
     </Modal>

    <Modal show={showModDeleteModal} size="sm">
      <Modal.Header>
        <Modal.Title>Delete message (as moderator)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you would like to delete {from}'s message?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary-outline" onClick={() => setShowModDeleteModal(false)}>No</Button>
        <Button variant="danger" onClick={handleModDelete}>Yes</Button>
      </Modal.Footer>
    </Modal>

    <Modal show={showIeModal} size="sm" onClose={setShowIeModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Is this message encrypted?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(type === 'publicRoom')
          ? <p>You are using a public room, which means that your messages are unencrypted and can be 
                  read by anyone</p>
          : <p>Your messages, while public, are encrypted using AES and can only be read by members of this
                  conversation</p>
        }
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={setShowIeModal(false)}>Got it!</Button>
      </Modal.Footer>
    </Modal>

    <DropdownButton
      variant="secondary-outline"
      size="sm"
      title={<FaInfo />}
     >
       {(currentIdentity === from)
           ?<div>
            <Dropdown.Item variant="danger" onClick={() => setShowDeleteModal(true)}>Delete Message</Dropdown.Item>
             <Dropdown.Item onClick={handEdit}>Edit Message</Dropdown.Item>
             </div>
           : null
       }
       {(isModerator(currentIdentity, type, name) && type !== 'privateChat')
          ? <div><Dropdown.Item variant="danger" onClick={() => setShowBlockModal(true)}>Block User</Dropdown.Item>
            <Dropdown.Item variant="danger" onClick={() => setShowModDeleteModal(true)}>Delete Message</Dropdown.Item>
            </div>
          : null
       }

       <Dropdown.Item href='/friends/'from>View Profile</Dropdown.Item>
       {(currentIdentity !== from)
         ? <Dropdown.Item href='/new/privateChat/'from>Send Message</Dropdown.Item>
         : null
       }
       <Dropdown.Divider />
       <Dropdown.Item onClick={() => setShowIeModal(true)}>Is this encrypted?</Dropdown.Item>
    </DropdownButton>

    </>

  )
}
