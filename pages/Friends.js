import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'
import { FriendSidebar, ViewFriend } from './../components'
import { friendsContainer, friendsSidebar, friendsMain } from './../jss/pages/Friends'
import { useFriends } from './../hooks/useFriends'

export default function Friends ({}) {
  const { friend } = useParams()

  return (
    <Container style={friendsContainer}>
      <Row>
        <Col style={friendsSidebar} md={4} lg={4}>
          <FriendSidebar />
        </Col>
        <Col style={friendsMain} md={8} lg={8}>
          <ViewFriend 
            {(friend) ? friend={friend} : noSelect={true} }
          />
        </Col>
      </Row>
    </Container>
  )
}