/**
File: components/IdentityItem.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component is used for rendering individual sub-identities within the ViewIdentities component, which is used within the Identities page (pages/Identities.js).
*/

import React, {useState} from 'react'
import { Form, Card } from 'react-bootstrap'
import { Identity } from './../services/Identity'
import { useIdentity } from './../hooks/useIdentity'

export default function IdentityItem ({ label, platform, username, publicKey, address }) {
  const [ secret, setSecret ] = useState()
  const [ showSecret, setShowSecret ] = useState(false)

  const { currentIdentity, pin } = useIdentity()
  const id = new Identity(currentIdentity)

  const handleSecret = async () => {
    await id.decryptSecretKey(label, pin)
        .then(s => setSecret(s))
    setShowSecret(true)
  }

  const handleHideSecret = async () => {
    setShowSecret(false)
    setSecret('')
  }

  return (
    <Card className="center-block" style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>@{username}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{platform}</Card.Subtitle>
        <Card.Text>
          <p><strong>Label:</strong>{' '}{label}</p>
          <p><strong>Public Key:</strong>{' '}{publicKey}</p>
          <p><strong>Secret Key:</strong>
            {(showSecret)
              ? (<><Form.Control value={secret} /><br><Card.Link onClick={handleHideSecret}>Hide secret</Card.Link></br></>)
              : <Card.Link onClick={handleSecret}>Click to show</Card.Link>
            }
          </p>         
        </Card.Text>
      </Card.Body>
    </Card>
  )
}
