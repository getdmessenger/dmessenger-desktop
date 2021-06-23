/**
File: popups/InviteUser.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: A popup used to invite a friend or remote user to a private room.
*/

import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, Spinner, Alert, ListGroup } from 'react-bootstrap'
import { FASearch } from 'react-icons/fa'
import { sign } from '@ddatabase/crypto'
import { useFetchUser, useIdentity } from './../hooks'
import { ReplicationDb, Identity } from './../services'
import { UserCard, FriendAvatar } from './../components'
import { getPrivateRoomDb } from './../data'

export default function InviteUser ({ show, onClose= f => f, id, name }) {
  const [ mode, setMode ] = useState()
  const [ searchedUser, setSearchedUser ] = useState()
  const [ friends, setFriends ] = useState()

  const { loading, error, data } = useFetchUser(searchedUser)
  const { pin } = useIdentity()

  const streamService = new ReplicationDb(id)
  const identity = new Identity(id)
  const db = await getPrivateRoomDb(name)
  const key = db.key

  useEffect(() => {
    (async () => {
      let remoteUsers = await identity.getRemoteUsers()
      setFriends(remoteUsers)
    })()
  }, [id])
  
  const handleUsername = event => setSearchedUser(event.target.value)

  const handleSearch  = () => setMode('searched')

  const handleInvite = async user => {
    const secret = identity.decryptSecretKey('default', pin)
    const signature = sign(id, secret)
    await streamService.addStream("pcap", {
      type: "privateRoom",
      name: id,
      publicKey: key,
      creator: id,
      signature: signature,
      intendedReceiver: user
    })
    setMode('invited')
  }
  
  return (
    <Modal show={show} onHide={onClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Invite Friend</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(mode === 'start')
           ?
           <> 
           <Button size="lg" variant="primary" onClick={() => setMode('friends')}>Invite Friends</Button>
             <Button size="lg" variant="secondary" onClick={() => setMode('search')}>Search For User</Button>
             </>
           : null
        }
        {(mode === 'friends')
           ?
           <> 
           <h3>Choose a friend to invite to @{name}</h3>
              <ListGroup>
                {friends.map(f => {
                  <ListGroup.Item onClick={handleInvite(f.username)}>
                    <FriendAvatar user={f.username} size="sm" /> {f.username}
                  </ListGroup.Item>
                })}
              </ListGroup>
              </>
           : null
        }
        {(mode === 'search')
           ?
           <> 
           <p>{error}</p>
             <h3>Enter a username</h3>
             <Form.Control size="lg" onChange={handleUsername} placeholder="Enter a username..." />
             <Button variant="primary" onClick={handleSearch}><FASearch /> Search for user</Button>
             </>
           : null
        }
        {(mode === 'searched')
          ? (loading)
              ? <Spinner />
              : null
          : (data)
              ? 
              <>
              <h2>Found @{searchedUser}</h2>
                 <UserCard
                   user={searchedUser}
                 />
                 <Button 
                   variant="success" 
                   size="lg" 
                   onClick={handleInvite(searchedUser)} 
                   block>Invite @{searchedUser}</Button>
                   </>
              : 
              <>
              <h2>Something went wrong!</h2>
                 <Button variant="success" size="lg" onClick={() => setMode('search')}> Try again!</Button>
                 </>
            
        }
        {(mode === 'invited')
           ? <Alert variant="success">
               User was invited!
             </Alert>
           : null

        }
      </Modal.Body>
    </Modal>
  )
}
