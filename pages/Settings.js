import React from 'react'
import {Container, Row, Col } from 'react-bootstrap'
import { SettingsSidebar, MainSettings } from './../components'
import { settingsContainer, settingsSidebar, settingsMain } from './../jss/pages/Settings'

export default function Settings ({}) {
  return (
    <Container style={settingsContainer}>
      <Row>
        <Col style={settingsSidebar} md={4} lg={4}>
          <SettingsSidebar />
        </Col>
        <Col style={settingsMain} md={8} lg={8}>
          <MainSettings />
        </Col>
      </Row>
    </Container>
  )
}
