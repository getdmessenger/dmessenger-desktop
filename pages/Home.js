import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Sidebar, ChatWindow } from './../components'
import { useMessenger } from './../hooks/useMessenger'

export default function Home ({}) {
  const { selectedChat, selectedType } = useMessenger()

  return (
    <Container>
      <Row>
        <Col md={4} lg={4}>
          <Sidebar />
        </Col>
        <Col md={8} lg={8}>
          <ChatWindow
            name={selectedChat}
            type={selectedType}
          />
        </Col>
      </Row>
    </Container>
  )
}