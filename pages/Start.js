/**
File: pages/Start.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the first page a user sees when they come to dMessenger. If they have already used an identity on the given device they're using, they will see a dropdown menu of those identities, of which they can select one and will be immediately authorized and logged-in, as long as they have write access to the document. Users also have the option of logging in with an identity that may be used on a separate device, which will allow them to gain authorization from that separate device to use the identity, or can simply create an all-new identity.
*/

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap/Button'
import { useIdentity } from './../hooks/useIdentity'
import { identitiesExist } from './../authentication/authHelpers'
import { Logo } from './../components/Logo'
import { ChooseIdentityDropdown } from './../components/ChooseIdentityDropdown'
import { startBoxStyle } from './../style/startBoxStyle'

export default function Start () {
  const { currentIdentity } = useIdentity()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentIdentity) navigate(`/auth/${currentIdentity}`)
    else return
  }, [currentIdentity])

  return (
    <div style={startBoxStyle}>
      <Logo />
      {(identitiesExist)
         ? 
         <div><p>Login with an identity you're used before:</p>
           <ChooseIdentityDropdown />
           <a href="/login">I don't see my ID here</a>
           </div>
         : null
      }
      <Button
        variant="success"
        size="lg"
        onClick={() => navigate('/signup/')}
        block>
          Create A PeepsID
      </Button>

      <p>Already have a PeepsID?</p>
      <Button
        variant="primary"
        size="lg"
        onClick={() => navigate('/login')}
        block>
          Login
       </Button>
     </div>
  )
}
