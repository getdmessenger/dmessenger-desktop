/**
File: popups/AddFriend.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This popup appears via the /friends/ page, when clicking the "Add Friend" button. It searches dWeb's DHT for a username, if found, it returns the related user data. 
*/

import React, { useState } from 'react'
import { Modal, Button, Form, Spinner } from 'react-bootstrap'
import { FASearch } from 'react-icons/fa'
import { useFetchUser } from './../hooks'
import { UserCard } from './'

export default function AddFriend ({ show, onClose= f => f }) {
  const [ addStatus, setAddStatus ] = useState('search')
  const [ liveValue, setLiveValue ] = useState()
  const [ searchValue, setSearchValue ] = useState()

  const { loading, error, data } = useFetchUser(searchValue)

  const handleSearch = () => {
    setAddStatus('searched')
    setSearchValue(liveValue)
  }

  const handleUsername = event => setLiveValue(event.target.value)
  const handleNewSearch = () => setAddStatus('search')

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Friend</Modal.Title>
      </Modal.Header>
      {(addStatus === 'search')
         ? (
         <>
         <Modal.Body>
             <h3>Enter a username</h3>
             <p>Search for a friend by entering their username below.</p>
             <Form.Control size="lg" onChange={handleUsername} placeholder="Enter a username..." />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleSearch}> <FASearch /> Search for user </Button>
          </Modal.Footer>
          </>
         )
        : 
        (
        <>
        <Modal.Body>
           {(loading)
              ? <Spinner />
              : (
                  (data)
                   ? (<>
                    <h2> Found @{searchValue}! </h2>
                     <UserCard
                       user={searchValue}
                     />
                     </>
                   )
                   : 
                   (<>
                   <h2>User was not found!</h2>
                      <p>Error: {error}</p>
                      </>
                   )
                      
                 )
           }
           </Modal.Body>
           <Modal.Footer>
             <Button variant="primary" onClick={handleNewSearch}><FASearch /> Search again</Button>
           </Modal.Footer>
           </>
           )
      }
    </Modal>
  )
}