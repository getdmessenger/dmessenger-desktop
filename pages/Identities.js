import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { SettingsSidebar, ViewIdentities } from './../components'
import { settingsContainer, settingsSidebar, settingsMain } from './../jss/pages/Settings'

export default function Identities ({}) {
  return (
    <Container style={settingsContainer}>
      <Row>
        <Col style={settingsSidebar} md={4} lg={4}>
          <SettingsSidebar />
        </Col>
        <Col style={settingsMain} md={8} lg={8}>
          <ViewIdentities />
        </Col>
      </Row>
    </Container>
  )
}