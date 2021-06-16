/**
File: components/Message.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component is used for rendering messages within the ChatWindow for a public room, private room or private chat.
*/

import React, { useEffect, useLayoutEffect, useState } from 'react'
import fs from 'fs'
import { randomBytes } from 'crypto'
import { Modal, Image, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { ReactPlayer } from 'react-player'
import AES from 'aes-oop'
import { useMessenger, useIdentity } from './../hooks'
import { FriendAvatar, ReactionBar, MessageDropdown, ReplyBubble } from './'
import { getLocalDb } from './../data/getLocalDb'
import { convertToEstimate } from './../helpers/roomHelpers'
import { BASE_DIRECTORY } from './../config'

export default function Message({
  name,
  type,
  from,
  key,
  message,
  isReply,
  isReplyTo,
  timestamp }) {
  const [ images, setImages ] = useState()
  const [ video, setVideo ] = useState()
  const [ currentImage, setCurrentImage ] = useState()
  const {
    showModal,
    setShowModal,
    imageInModal,
    setImageInModal,
    replyingTo,
    setReplyingTo 
  } = useMessenger()
  const { currentIdentity, pin } = useIdentity()

  const localDb = await getLocalDb(currentIdentity)
  const timeEst = convertToEstimate(timestamp)
 
  const handleEnlargeImage = x => {
    setShowModal(true)
    setImageInModal(x)
  }
 
  const handleClose = () => {
    setShowModal(false)
    setImageInModal()
  }

  useLayoutEffect(() => {
    (async () => {
      let encryptedSeed 
      if (type === 'privateRoom' || type === 'privateChat') {
        if (type === 'privateRoom') encryptedSeed = localDb.getPrivateRoomSeed(name)
        if (type === 'privateChat') encryptedSeed = localDb.getPrivateChatSeed(name)
        let decryptedSeed = AES.decrypt(encryptedSeed, pin)
        message = AES.decrypt(message, decryptedSeed)
      }
    })()
  }, [])

  useEffect(() => {
    if (message.video) {
      let videoDir = path.join(BASE_DIRECTORY, 'videos')
      let randomFilename = randomBytes(32)
      let videoPath = path.join(videoDir, randomFilename + '.mp4')
      fs.writeFile(videoPath, message.video, (err) => {
        if (err) return
      })
      setVideo(videoPath)
    }
  }, [])

  useEffect(() => {
    if (message.images) {
      let imgDir = path.join(BASE_DIRECTORY, 'images')
      let imageArray = message.images
      for (const img of imageArray) {
        let randomFilename = randomBytes(32)
        let imagePath = path.join(imgDir, randomFilename + '.gif')
        fs.writeFile(imagePath, img, (err) => {
          if (err) return
        })
        setImages(...images, imagePath)
      }
    }
  }, [])

  return (
    <>
    <Modal
      show={showModal}
      onHide={handleClose}
      backdrop={true}
      size={lg}
      centered={true}
      autoFocus={true}
    >
      <Modal.Header closeButton>
        <Modal.Title>{imageInModal}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image src={imageinModal} fluid />
      </Modal.Body>
    </Modal>

    {(isReply)
       ? <ReplyBubble
           isReplyTo={isReplyTo}
         />
       :  null
    }
    
    <div id={key}>
      <Card>
        <Card.Header as="h5">
          <FriendAvatar from={from} size="sm" />
          <Link to={`/friend/${from}`}>
            <strong className="mr-auto">@{from}</strong>
          </Link>
          <small>{timeEst}</small>
          <MessageDropdown
            name={name}
            type={type}
            message={message}
            isReply={isReply}
            isReplyTo={isReplyTo}
            timestamp={timestamp}
            from={from}
            id={key}
          />
        </Card.Header>
        <Card.Body>
          <Card.Text className="mb-4">{message.data}</Card.Text>
          {(images)
             ? <span>
                {images.map(x => {
                   <Image className="mr-2" src={x} onClick={handleEnlargeImage(x)} thumbnail />
                })} </span>
             :  null 
          }
          {(video)
             ? <ReactPlayer
                 width="inherit"
                 height="inherit"
                 url={video}
                 playing={true}
                 volume={true}
                />
             :  null
          }
        </Card.Body>
        <Card.Footer>
          <ReactionBar
            id={key}
            name={name}
            type={type}
          />
        </Card.Footer>
      </Card>
    </div>
    </>
  ) 
}