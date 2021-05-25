/**
File: pages/Start.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the first page a user sees. If they already have identities present on their computer, they will see a dropdown where they can select an identity and proceed to authentication, or they can click the "Create An Identity" button to proceed to the identity creation process at /signup/.
*/

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap/Button'
import { useIdentity } from './../hooks/useIdentity'
import { identitiesExist } from './../authentication/authHelpers'
import { Logo } from './../components/Logo'
import { ChooseIdentityDropdown } from './../components/ChooseIdentityDropdown'
import { startBox, createIdentityButton } from './../jss/pages/Start'

export default function Start () {
  const navigate = useNavigate()
  const { currentIdentity } = useIdentity()

  // onload, if a user is currently logged-in, send them to the /auth/ screen and re-authenticate
  // if not, the user is logged-out and should remain on this screen
  useEffect(() => {
    if (currentIdentity) {
      navigate(`/auth/${currentIdentity}`)
    } 
    if (!currentIdentity) return 
  }, [currentIdentity])

  return (
    <div style={startBox}>
      <Logo />
      {(identitiesExist) ?
       <ChooseIdentityDropdown /> : 
      <Button
        variant="success"
        style={createIdentityButton}
        size="lg"
        onClick={() => navigate(`/signup`)}
        block> Create An Identity
      </Button>
      }
    </div>
  )
}