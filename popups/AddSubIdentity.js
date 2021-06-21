/**
File: popups/AddSubIdentity.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This popup allows users to add a new sub-identity via the Identities page (/settings/identities).
*/

import React, { useState } from 'react'
import { Modal, Button, Form, Alert } from 'react-bootstrap'
import { Identity } from './../services'
import { useIdentity } from './../hooks'
import { getIdentityInstance } from './../identity'

export default function AddSubIdentity ({ show, onClose= f => f }) {
  const [ error, setError ] = useState()
  const [ label, setLabel ] = useState()
  const [ platform, setPlatform ] = useState()
  const [ address, setAddress ] = useState()
  const [ username, setUsername ] = useState()
  const [ publicKey, setPublicKey ] = useState()
  const [ secretKey, setSecretKey ] = useState()
  const [ saved, setSaved ] = useState(false)
  const [ type, setType ] = useState()
  
  const { currentIdentity, pin } = useIdentity()
  
  const identityService = new Identity(currentIdentity)
  const identity = await getIdentityInstance(currentIdentity)

  const handleSubmit = async () => {
    let seed = identityService.getDecryptedSeed(pin)
    const encryptedSecret = identityService.encrypt(secretKey, seed)
    if (label.length < 1) return handleError('You must enter a label.')
    if (address.length < 1) return handleError('You must enter an account address.')
    if (platform.length < 1) return handleError('You must enter a platform.')
    if (username.length < 1) return handleError('You must enter a username.')
    if (publicKey.length < 1) return handleError('You must enter a public key.')
    if (secretKey.length < 1) return handleError('You must enter a secret key.')

    
    await identity.addSubIdentity(label, {
        label: label,
        platform: platform,
        address: address,
        username: username,
        publicKey: publicKey,
        secretKey: secretKey,
        type: type
      }).catch(err => handleError(`Identity already exists: ${err}.`));
      
      clearForms()
      setSaved(true)
      setTimeout(setSaved(false, 10000))

  }

  const clearForms = () => {
    setLabel()
    setPlatform()
    setAddress()
    setUsername()
    setPublicKey()
    setSecretKey()
    setType()
    setError()
  }

  const handleError = (err) => {
    setError(err)
    setTimeout(setError(), 10000)
  }

  return (
    <Modal show={show} onHide={onClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Add Sub-Identity</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h2>Add a sub-identity</h2>
        {(saved)
          ? <Alert variant="success">Identity was added!</Alert>
          : null
        }
        {(error)
          ? <Alert variant="danger">{error}</Alert>
          : null
        }
        <h4>Identity label:</h4>
        <Form.Control size="lg" value={label} onChange={event => setLabel(event.target.value)} />
       
        <h4>Identity platform:</h4>
        <Form.Control size="lg" onChange={event => setPlatform(event.target.value.toLowercase)}>
          <option>Bitcoin</option>
          <option>Ethereum</option>
          <option>Dogecoin</option>
          <option>ARISEN</option>
          <option>BitShares</option>
          <option>EOS</option>
          <option>dWebID</option>
          <option>Other</option>
        </Form.Control>

        <h4>Choose identity type:</h4>
        <Form.Control as="select" onChange={event => setType(event.target.value.toLowercase)}>
        {(type === 'bitcoin' || type === 'ethereum' || type === 'dogecoin' || type === 'arisen' || type === 'bitshares' || type === 'dwebid' || type === 'eos') 
            ?
            <> 
            <option>Blockchain</option>
               <option>Other</option>
               </>
            : 
            <>
            <option>Other</option>
              <option>Blockchain</option>
              </>
        }
        </Form.Control>
    
       <h4>Enter account address:</h4>
       <Form.Control size="lg" value={address} onChange={event => setAccount(event.target.value)} />

       <h4>Enter username:</h4>
       <Form.Control size="lg" value={username} onChange={event => setUsername(event.target.value)} />

       <h4>Enter public key:</h4>
       <Form.Control size="lg" value={publicKey} onChange={event => setPublicKey(event.target.value)} />
        
       <h4>Enter secret key:</h4>
       <Form.Control size="lg" value={secretKey} type="password" onChange={event => setSecretKey(event.target.value)} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleIdSubmit}>Add Sub-Identity</Button>
      </Modal.Footer>
    </Modal>
  )
}
