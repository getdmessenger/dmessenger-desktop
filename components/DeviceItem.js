/**
File: components/DeviceItem.js
Author: Jared Rice Sr. <jared@peepsx.com
Description: Renders an individual device on the /devices/ page, allowing users to view and deauthorize devices.
*/

import React, { useState, useEffect } from 'react'
import { Modal, Card, Button, Badge } from 'react-bootstrap'
import dswarm from 'dswarm'
import { useIdentity } from './../hooks'
import { getIdentityInstance } from './../identity'

export default function DeviceItem ({ data }) {
  const [ peers, setPeers ] = useState()
  const [ showModal, setShowModal ] = useState(false)

  
  const { currentIdentity } = useIdentity()
  let identity = await getIdentityInstance(currentIdentity)

  useEffect(() => {
    let swarm = dswarm()

    swarm.join(data.deviceId, {
      announce: true,
      lookup: true
    })

    swarm.on('connection', (err, socket) => {
      setPeers(peers + 1)
    })
    
    swarm.on('disconnection', (err, socket) => {
      setPeers(peers - 1)
    })
  }, [])

  const removeDevice = async () => {
    await identity.removeDevice(data.deviceId)
    setRemoved(true)
    setTimeout(setRemoved(false), 10000)
  }

  return (
      <>
    <Modal show={showModal} onHide={setShowModal(false)} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Deauthorize Device</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Would you like to deauthorize the following device:</h4>
        <p><strong>Device ID:</strong>{data.deviceId}</p>
        <p><strong>Device Label:</strong>{data.label}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={setShowModal(false)}>No!</Button>
        <Button variant="danger" onClick={removeDevice}>Yes, remove device</Button>
      </Modal.Footer>
    </Modal>
    <Card style={{width: '18rem'}}>
      <Card.Body>
        <Card.Title>{data.label}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">dWeb address:</Card.Subtitle>
        <Card.Text>{data.deviceId}</Card.Text>
        <span>
          <Button variant="primary">
            Peers <Badge variant="light">{peers}</Badge>
          </Button>
          <Card.Link onClick={() => setShowModal(true)}>Deauthorize Device</Card.Link>
        </span>
      </Card.Body>
    </Card>
    </>
  )
}
