/**
File: pages/PublicRoom.js
Author: Jared Rice Sr. <jared@peepsx.com> 
Description: This is the Public Room page (/public-room/:roomName) that displays the Sidebar/ChatWindow for a public room.
*/
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Col, Row } from 'react-bootstrap'
import { Sidebar, ChatWindow } from './../components'
import { ChatHeader } from './../components/ChatHeader'
import { useMessenger } from './../hooks/useMessenger'

export default function PublicRoom ({}) {
  const { name } = useParams()
  const { setSelectedChat, setSelectedType } = useMessenger()

  useEffect(() => {
    setSelectedChat(name)
    setSelectedType("publicRoom")
  }, [])
  
  return (
    <Container>
      <Row>
        <Col md={4} lg={4}>
          <Sidebar />
        </Col>
        <Col md={8} lg={8}>
        <ChatHeader name={name} type="publicRoom" />
          <ChatWindow
            name={name}
            type='publicRoom'/>
        </Col>
      </Row>
    </Container> 
  )
}
