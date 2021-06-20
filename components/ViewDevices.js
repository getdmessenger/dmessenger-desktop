/**
File: components/ViewDevices.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Main component within the /devices/ page, allowing users to deauthorize and view devices associated with their dWeb identity.
*/

import React, { useState, useEffect } from 'react'
import { Container, Row } from 'react-bootstrap'
import { useIdentity } from './../hooks'
import { getIdentityInstance } from './../identity'

export default function ViewDevices ({}) {
  const [ devices, setDevices ] = useState()
  const { currentIdentity, deviceId } = useIdentity()
  
  let identity = await getIdentityInstance(currentIdentity)
  
  useEffect(() => {
    let deviceList = identity.getDevices()
    setDevices(deviceList)
  })

  return (
    <Container fluid>
      <Row className="mb-2">
        <h3>This device</h3>
        <p>Below are the details regarding this device and its dWeb identifier.</p>
        <ThisDevice />
      </Row>
      <Row className="mb-2">
        <h3>Other devices</h3>
        <p>Below are other devices that are using @{currentIdentity}.</p>
        <span>
          {(devices.filter(i => i.deviceId === deviceId)
                       .map(d => {
                 <DeviceItem data={d} />
          }))}
        </span>
      </Row>
    </Container>
  )
}