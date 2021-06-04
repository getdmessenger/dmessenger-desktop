/**
File: pages/SyncRemoteComplete.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This page lets a remote device (the master device) know that they have successfully completed the identity sync process from that device. 
*/

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap/Button'
import { Logo } from './../components/Logo'
import { ConfirmPinPopup } from './../popups/ConfirmPinPopup'
import { useIdentity } from './../hooks/useIdentity'
import { confirmPin } from './../authentication/confirmPin'

export default function SyncRemoteComplete () {
  const {
    pinPad,
    togglePinPad,
    idError,
    generateIdError,
    idSwitch,
    loginUser,
    logoutUser,
    resetSyncFull,
    resetSyncState
  } = useIdentity()

  const handleIdentitySwitchBack = async (value) => {
    if (await confirmPin(currentIdentity, value)) {
      let previousId = idSwitch.oldUser
      logoutUser()
      loginUser(previousId)
      togglePinPad()
      navigate('/home')
      resetSyncFull()
    }  else {
      handleError('Switching back to your previously logged-in identity failed.')
    }
  }

  if (!idError) {
    render (
        <>
      <div style={successBox}>
        <Logo />
        <h1>ID Sync Was Successful!</h1>
        <p>Congrats! {syncUser} can now be used across more than just this device!</p>

        { (idSwitch)
            ? <Button 
                variant="success" 
                size="lg" 
                onClick={() => togglePinPad()} 
                block>
                  Switch Back To {idSwitch.oldUser}
              </Button>
            : <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/home')}
                block>
                  Go Back Home
              </Button>
        }
      </div>
      <ConfirmPinPopup
        onComplete={handleIdentitySwitchBack}
        show={pinPad}
      />
      </>
    )
  }  else {
    render (
      <div style={successBox}>
        <Logo />
        <h1>An error has occurred!</h1>
        <p>{idError}</p>
      </div>
    )
  }
}