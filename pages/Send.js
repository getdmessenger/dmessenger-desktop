import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { WalletSidebar, SendMoney } from './../components'
import { walletContainer, walletSidebar, walletMain } from './../jss/pages/Wallet'

export default function Send ({}) {
  return (
    <Container style={walletContainer}>
      <Row>
        <Col style={walletSidebar} md={4} lg={4}>
          <WalletSidebar />
        </Col>
        <Col style={walletMain} md={8} lg={8}>
          <SendMoney />
        </Col>
      </Row>
    </Container>
  )
}