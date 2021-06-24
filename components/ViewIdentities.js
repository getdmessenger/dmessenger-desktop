/**
File: components/ViewIdentities.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component is the main render within the Identities page (pages/Identities.js). It render's a user's master identity and sub-identities.
*/

import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { useIdentity } from './../hooks/useIdentity'
import { getIdentityInstance } from './../identity'
import { AddSubIdentity } from './../popups'
import { MasterIdentity, IdentityItem } from './'

export default function ViewIdentities ({}) {
  const [ list, setList ] = useState()
  const [ showAdd, setShowAdd ] = useState()
  
  const { currentIdentity } = useIdentity()
  const id = await getIdentityInstance(currentIdentity)
  
  useEffect(() => {
    (async () => {
      await id.listSubIdentities()
        .then(ls => setList(ls))
    })()
  })

  return (
      <>
    <AddSubIdentity show={showAdd} onClose={() => setShowAdd(false)} />
    <Container fluid>
      <Row className="mb-2">
        <h3 className="justify-content-md-left">Master Identity</h3>
        <hr />
        <p className="mb-2">Below are the details associated with your identity document's master identity</p>
        <MasterIdentity user={currentIdentity} />
      </Row>
      <Row className="mb-2">
        <Col md={8} lg={8}>
          <h3>Sub-Identities</h3>
          <p>Below are sub-identities associated with this identity document.</p>
        </Col>
        <Col md={2} lg={2}>
          <Button
            variant="primary"
            onClick={() => setShowAdd(true)}
          > 
            Add New Sub-Identity
          </Button>
        </Col>
        <hr className="mb-2" />
        <span>
          {list.map(i => {
            <IdentityItem
              label={i.label}
              platform={i.platform}
              username={i.username}
              publicKey={i.publicKey}
              address={i.address}
            />
          })}
        </span>
      </Row>
    </Container>
    </>
  )
}
