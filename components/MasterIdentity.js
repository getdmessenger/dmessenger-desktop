/**
File: components/MasterIdentity.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Displays the master identity within a user's currently authenticated identity document.
*/

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge } from 'react-bootstrap'
import dswarm from 'dswarm'
import { useIdentity } from './../hooks'
import { getIdentityInstance } from './../identity'

export default function MasterIdentity ({}) {
  const [ peers, setPeers ] = useState()
  const [ key, setKey ] = useState()
  
  const { currentIdentity } = useIdentity()
  const identity = await getIdentityInstance(currentIdentity)

  useEffect(() => {
    let userData = identity.getDefaultUser()
    setKey = userData.publicKey 
  })
  
  useEffect(() => {
    let swarm = dswarm()

    swarm.join(key, {
      announce: true,
      lookup: true
    })

    swarm.on('connection', (err, socket) => {
      setPeers(peers + 1)
    })

    swarm.on('disconnection'), (err, socket) => {
      setPeers(peers - 1)
    }
  }, [])

  return (
    <Card>
      <Card.Header as="h5">{currentIdentity}</Card.Header>
      <Card.Body>
        <Card.Title>Network Address:</Card.Title>
        <Card.Text>{key}</Card.Text>
        <Button variant="primary">
          Connected Peers <Badge variant="light">{peers}</Badge>
        </Button>
      </Card.Body>
    </Card>
  )
}