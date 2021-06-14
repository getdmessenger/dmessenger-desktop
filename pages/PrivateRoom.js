import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Col, Row } from 'react-bootstrap'
import { Sidebar, ChatWindow } from './../components'
import { ChatHeader } from './../components/ChatHeader'
import { useMessenger } from './../hooks/useMessenger'

export default function PrivateRoom ({}) {
  const { name } = useParams()
  const { setSelectedChat, setSelectedType } = useMessenger()

  useEffect(() => {
    setSelectedChat(name)
    setSelectedType("privateRoom")
  }, [])

  return (
    <Container> 
      <Row>
        <Col md={4} lg={4}>
          <Sidebar />
        </Col>
        <Col md={8} lg={8}>
        <ChatHeader name={name} type="privateRoom" />
          <ChatWindow
            name={name}
            type='privateRoom'
          />
        </Col>
      </Row>
    </Container>
  )
}