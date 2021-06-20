/**
File: components/ThisDevice.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component renders a user's current device, within the /devices/ page (within the ViewDevices component).
*/
import React, { useState, useEffect } from 'react'
import { Card, Button, Badge } from 'react-bootstrap'
import fs from 'fs'
import path from 'path'
import dswarm from 'dswarm'
import { useIdentity } from './../hooks'
import { getIdentityInstance } from './../identity'
import { DEVICE_DIR } from './../config'

export default function ThisDevice ({}) {
  const [ deviceData, setDeviceData ] = useState()
  const [ peers, setPeers ] = useState()
  const [ error, setError ] = useState()

  const { currentIdentity, deviceId } = useIdentity()
  
  const identity = await getIdentityInstance(currentIdentity)

  useEffect(() => {
    const deviceFilePath = path.join(DEVICE_DIR, `${deviceId}.device`)
    fs.readFile(deviceFilePath, "utf8", (err, text) => {
      if (err) setError('Cannot open .device file.')
      let data = null
      try {
        data = JSON.parse(text)
        setDeviceData(data)
      } catch (e) {
        setError(e)
      }
    })
  })

  useEffect(() => {
    let swarm = dswarm()
    swarm.join(deviceId, {
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

  return (
    <Card>
      <Card.Header as="h5">{deviceData.label}</Card.Header>
      <Card.Body>
        {(error) 
           ? <p>{error}</p>
           : 
           <>
           <Card.Title>Network address:</Card.Title>
             <Card.Text>{deviceData.deviceId}</Card.Text>
             <Button variant="primary">
               Connected Peers <Badge variant="light">{peers}</Badge>
             </Button>
             </>
        }
     </Card.Body>
    </Card>
  )
}