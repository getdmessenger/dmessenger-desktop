/**
File: components/MyCard.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component renders the logged-in user's avatar, their username and their total balance, within the SideBarHeader.
*/ 

import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'
import { useIdentity } from './../hooks'
import { MyAvatar, MyTotalBalance } from './'

export default function MyCard ({}) {
  const { currentIdentity } = useIdentity()
  
  return (
    <Container fluid >
      <Row>
        <Col md={4} lg={4}>
          <Link to="/settings/profile">
            <MyAvatar user={currentIdentity} />
          </Link>
        </Col>
        <Col md={6} lg={6}>
          <Row className="content-justify-left">
            <Link to='/settings/profile'>@{currentIdentity}</Link>
          </Row>
          <Row className="content-justify-left">
            <MyTotalBalance />
          </Row>
        </Col>
      </Row>
    </Container>
  )
}