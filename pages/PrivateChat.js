/**
File: pages/PrivateChat.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description:
*/

import React, { useEffect, useState } from 'react'
import { Container, Col, Row } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { Sidebar, ChatWindow } from './../components'
import { ChatHeader } from './../components/ChatHeader'
import { useMessenger } from './../hooks/useMessenger'

export default function PrivateChat ({}) {
  const { name } = useParams()
  const { setSelectedChat, setSelectedType } = useMessenger()

  useEffect(() => {
    setSelectedChat(name)
    setSelectedType("privateChat")
  }, [])


  return (
    <Container>
      <Row>
        <Col md={4} lg={4}>
          <Sidebar />
        </Col>
        <Col md={8} lg={8}>
        <ChatHeader name={name} type="privateChat" />

          <ChatWindow
            name={name}
            type='privateChat'/>
        </Col>
      </Row>
    </Container>
  )
}
