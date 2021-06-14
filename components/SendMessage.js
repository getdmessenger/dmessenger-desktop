/**
File: components/SendMessage.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component renders the SendMessage bar at the bottom of the ChatWindow and is used for composing messages, digitally signing the composed message and dispatching it to a public room, private room or private chat's distributed database. The SendMessage bar allows users to attach videos and images to messages, along with OS-specific emojis.
*/

import React, { useState, useReducer, useEffect } from 'react'
import { Form, Alert, InputGroup, Button } from 'react-bootstrap'
import { FACamera, FAVideo } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Picker from 'emoji-picker-react'
import AES from 'aes-oop'
import { useMessenger, useIdentity } from './../hooks'
import { createMessage, editMessage } from './../data'
import { getLocalDb } from './../data/getLocalDb'

export default function SendMessage ({ name, type }) {
  const [ inputValue, setInputValue ] = useReducer(
    (inputValue, newDetails) => ({...inputValue, ...newDetails }), ''))
  const [ video, setVideo ] = useState()
  const [ images, setImages ] = useState()
  const [ imageData, setImageData ] = useState()
  const [editingValue, setEditingValue ] = useState()
  const { replyingTo, setReplyingTo, editing, setEditing } = useMessenger()
  const { currentIdentity, pin } = useIdentity()

  const localDb = await getLocalDb(currentIdentity)

  useEffect(() => {
    setEditingValue(editing.message.data)
  }, [editing])

  const handleVideoUpload = event => {
    const file = event.target.files[0]
    const data = fs.readFileSync(file)
    setVideo(data)
  }

  const handlePhotoUpload = event => {
    const file = event.target.files[0]
    const data = fs.readFileSync(file)
    setImages(...images, file)
    setImageData(...imageData, data)
  }

  const handleRemoveUploads = () => {
    setImages('')
    setImageData('')
    setVideo('')
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (type === 'privateRoom') let encryptedSeed = localDb.getPrivateRoomSeed(name)
    if (type === 'privateChat') let encryptedSeed = localDb.getPrivateChatSeed(name)
    if (type === 'privateRoom' || type === 'privateChat') let decryptedSeed = AES.decrypt(encryptedSeed, pin)
    const message = {  data: inputValue, images: imageData, video: video }
    await createMessage(type, message, {
      name: name,
      pin: pin,
      (replyingTo) ? isReply: true, isReplyTo: replyingTo,
                         : isReply: false, isReplyTo: null,
      (type === 'privateRoom' || type === 'privateChat') ? encryptedSeed: decryptedSeed: null
    })
    setReplyingTo('')
    setInputValue('')
  }

  const handleEditSubmit = async event => {
    event.preventDefault()
    if (type === 'privateRoom') let encryptedSeed = localDb.getPrivateRoomSeed(name)
    if (type === 'privateChat') let encryptedSeed = localDb.getPrivateChatSeed(name)
    if (type === 'privateRoom' || type === 'privateChat') let decryptedSeed = AES.decrypt(encryptedSeed, pin)
    let message = { data: inputValue, images: imageData, video: video }
    await editMessage(type, message, {
      name: name,
      pin: pin,
      (editing.isReply) ? isReply: true, isReplyTo: editing.isReplyTo,
                               : isReply: false, isReplyTo: null,
      (type === 'privateRoom' || type === 'privateChat') ? encryptSeed: decryptedSeed : null
    })
    setEditing('')
    setInputValue('')
  }

  const handleEditChange = event => setEditingValue(event.target.value)
  const handleMessageChange = event => setInputValue(event.target.value)
  const onEmojiClick = (event, emojiObject) => setInputValue(' ' + emojiObject.unified)

  return (
    <input accept="image/gif" type="file"
      onChange={handlePhotoUpload}
      style={{display:'none'}}
      id="photo-upload" />

    <input accept="video/mp4" type="file"
      onChange={handleVideoUpload}
      style={{display:'none'}}
      id="video-upload" />

    {(images || video)
      ?  <Alert variant="light" onClose={handleRemoveUploads} dismissable>
           <Alert.Heading>
             {(images && !video)
                ? You have attached {images.length - 1} images!
                : null
             }
             {(!images && video)
                ? You have attached a video!
                : null
             }
             {(images && video)
                ? You have attached {images.length - 1} images and a video!
                : null
             }
           </Alert.Heading>
           <span>
             {images.map(x => {
               <Image className="mr-2" src={x} thumbnail />
             })}
           </span>
           <hr>
           <div className="d-flex" justify-content-end">
             <Button onClick={handleRemoveUploads} variant="outline-danger">
               Remove attachments
             </Button>
           </div>
         </Alert>
      : null
    }

    {(!editing)
       ? <Form onSubmit={handleSubmit}>
           {(!replyingTo)
             ? <Form.Control
                 type="text"
                 placeholder="Say something..."
                 size="lg"
                 value={inputValue}
                 onChange={handleMessageChange}
               />
            :  <InputGroup size="lg">
                 <InputGroup.Prepend>
                   <InputGroup.Text id="replyToInput">
                     Replying to @{replyingTo.user}
                   </InputGroup.Text>
                 </InputGroup.Prepend>
                 <FormControl
                   type="text"
                   placeholder="Type your reply..."
                   aria-describedby="replyToInput"
                   value={inputValue}
                   onChange={handleMessageChange}
                 />
               </InputGroup>
           }
         </Form>

       : <EditingAlert />
          <Form onSubmit={handleEditSubmit}>
            <InputGroup size="lg">
              <InputGroup.Prepend>
                <InputGroup.Text id="editInput">
                  Editing...
                </InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                type="text"
                aria-describedby="editInput"
                value={editingValue}
                onChange={handleEditChange}
              />
            </InputGroup>
          </Form>
    }

    <Picker onEmojiClick={onEmojiClick} />

    <Form>
      <Form.File.Label htmlFor="photo-upload">
        <Button variant="primary" size="sm"><FACamera /></Button>
      </Form.File.Label>
    </Form>

    <Form>
      <Form.File.Label htmlFor="video-upload">
        <Button variant="secondary" size="sm"><FAVideo /></Button>
      </Form.File.Label>
    </Form>
  )  
}