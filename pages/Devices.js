import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { SettingsSidebar, ViewDevices } from './../components'
import { settingsContainer, settingsSidebar, settingsMain } from './../pages/Settings'

export default function Devices ({}) {
  return (
    <Container style={settingsContainer}>
      <Row>
        <Col style={settingsSidebar} md={4} lg={4}>
          <SettingsSidebar />
        </Col>
        <Col style={settingsMain} md={8} lg={8}>
          <ViewDevices />
        </Col>
      </Row>
    </Container>
  )
}