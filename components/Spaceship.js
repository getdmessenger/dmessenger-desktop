/**
File: components/Spaceship.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Renders a coming soon screen.
*/

import React from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'

export default function Spaceship ({}) {
  return (
    <Container fluid>
      <Row className="content-justify-center center-block">
        <h3>We're in our spaceship, preparing something that is better than a bank... check back later</h3>
        <Button variant="success" size="lg" href="/home" block>Back to home</Button>
      </Row>
    </Container>
  )
}