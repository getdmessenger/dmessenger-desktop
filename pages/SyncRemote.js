/**
File: pages/SyncRemote.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: User interface that handles the remote sync process.
*/

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap/Button'
import { Logo } from './../components/Logo'
import { ConfirmPinPopup } from './../popups/ConfirmPinPopup'
import { useIdentity } from './../hooks/useIdentity'
import { confirmPin } from './../authentication/confirmPin'
import { checkForUser } from './../authentication/syncHelpers'
import { Identity } from './../services/Identity'
import { syncRemoteBox } from './../jss/pages/SyncRemote'

export default function SyncRemote () {
  const {
    syncUser,
    syncStatus,
    resetSyncState,
    showCode,
    pushDestroySync,
    destroySync,
    pinPad,
    togglePinPad,
    currentIdentity,
    loginUser,
    logoutUser,
    syncAccepted,
    pushSyncAcceptance,
    idError,
    generatedIdError,
    pushSeed,
    pushHasSeed,
    seed,
    clearSeed,
    pushIdSwitch,
    switchPopup,
    toggleSwitchPopup
  } = useIdentity()

  const navigate = useNavigate()

  // Informs the protocol stream in Controller, that the remote user has accepted the request.

  const handleAccept = () => pushSyncAcceptance(true)
  
  /**
   COMMENT:
   Informs the protocol stream in dMessenger's Controller, that the remote user has rejected the request.
   This also informs the Controller to destroy the stream by setting pushDestroySync to true.
  */

  const handleReject = () => {
    if (!destroySync) {
      pushDestroySync(true)
      resetSyncState()
      navigate('/home')
    }
    else {
      return
    }
  }

  /**
    COMMENT:
    Pin entered by user is confirmed, the seed for that particular user is retrieved from the privateDb,
    then decrypted, and then stored in state using pushSeed. The controller is informed that the seed
    is available for the releaseseed handler, by setting hasSeed to true.
  */

  const handlePin = value => {
    if (await confirmPin(syncUser, value)) {
      let pin = value
      let id = new Identity(syncUser)
      let decryptedSeed = id.getDecryptedSeed(pin)
      if (!seed) {
        pushSeed(seed)
      } else {
        clearSeed()
        pushSeed(seed)
      }
      pushHasSeed(true)
    } else {
      handleError('You entered an incorrect pin.')
    }
  }

  // On error, we reset the sync state, and generate an ID error, which forces the UI to display the error.

  const handleError = err => {
    showCode(false)
    togglePinPad()
    resetSyncState()
    generateIdError(err)
  }
  
  /**
  COMMENT:
  In the event that the identity currently logged-in on the remote device, is different from the identity that
  needs to be authorized on the initiating device, we set state here so that the UI can instead display
  the process for switching between identities. This immediately asks the user to enter a pin for the 
  syncUser (the user the initating device is looking for permission to use). syncUser is sent by the initiating 
  device in an "open" message, right after the handshake has finalized.
  */

  const handleWrongUser = () => {
    pushWrongUser(true)
    toggleSwitchPopup()
  }

  /** 
    COMMENT:
    This handler confirms the pin for the syncUser (entered after handleWrongUser() has been activated). Once
    the pin is confirmed, we set the idSwitch state, with the old identity (currentIdentity), and the new identity
    (syncUser) so that the user can switch back to the original account after the authorization process has completed     successfully (see SyncRemoteComplete.js). Once idSwitch is set (using pushIdSwitch), the 
    currentIdentity is logged out, and the syncUser is logged-in.
  */

  const handleIdentitySwitch = value => {
    if (await confirmPin(syncUser, value)) {
      pushIdSwitch({
        oldUser: currentIdentity,
        switchedUser: syncUser
      })
      logoutUser()
      loginUser(syncUser)
    }  else {
      handleError('Switching identities failed, because you entered an incorrect pin.')
    }
  }

  /**
  COMMENT:
  After the UI is rendered and state is loaded, we check to see:
  1. If a user is not currently logged-in, and the identity doesn't exist on the device, 
      we inform the Controller to cancel the stream.
  2. If a user is not currently logged-in, yet the identity exists on the device, we initiate handleWrongUser()
      which starts the identity switch process.
  3. Check to see if this device has the ID related to syncUser. 
      if not, we inform Controller to cancel stream
  4. If the currently logged-in user is not the same as syncUser, we initiate handleWrongUser()
  5. If currentIdentity is the same as syncUser, we make sure the wrongUser state is set to false and the 
      normal sync process is initiated.
  */

  useEffect(() => {
    if (!currentIdentity && !checkForIdentity(syncUser)) pushCancelStream()
    if (!currentIdentity && checkForIdentity(syncUser)) handleWrongUser()
    if (!checkForIdentity(syncUser)) pushCancelStream()
    if (currentIdentity !== syncUser) handleWrongUser()
    if (currentIdentity === syncUser) pushWrongUser(false)
  }, [currentIdentity])

  // If the wrongUser state is set to false, we render the following UI:

  if (!wrongUser) {
    render (
      <div style={syncRemoteBox}>
        <Logo />
        <DeviceCodePopup
          onClick={handleReject}
          show={showCode}
        />
        <ConfirmPinPopup
          onComplete={(value) => handlePin(value)}
          onClick={handleReject}
          show={pinPad}
        />

        // If sync hasn't been accepted, this is displayed to the user

        { (!syncAccepted)
            ? 
            <div> <h1>Are you ready to do something totally badass?</h1>
                <p>From somewhere deep in the galaxy, another device is attempting to contact you and wants you
                     authorize it. If you don't know about this request, you should probably abort the process. If you do know
                     about it, lets get this party started.</p>
                     <Button
                       variant="primary"
                       size="lg"
                       onClick={() => handleAccept()}
                       block>
                          Accept and Go!
                      </Button>
                      <Button
                        variant="danger"
                        size="lg"
                        onClick={() => handleReject()}
                        block>
                          Reject Request
                      </Button>

                      </div>

            /**
            COMMENT:
            Once sync has been accepted, the following statuses are displayed to the user, as different
            portions of the SIEP protocol take place.
            */

            : 

            <div>
            
            { (syncStatus === 'device-verification')
                  ? 
                  <div><h1>Waiting on the remote device to verify device code...</h1>
                     <p>I am waiting on the remote device to verify the secret device code I just displayed</p>
                     </div>
                  : null
              }
              { (syncStatus === 'device-confirmed')
                 ? 
                 <div>
                 <h1>The remote device has confirmed the device code...</h1>
                    <p>Now I'm attempting to securely send your seed, which is the new and nerdy way of saying that
                         I'm making sure you're safe and sound</p>
                         </div>
                 : null
              }
              { (syncStatus === 'waiting-on-key')
                 ?  
                 <div>
                 <h1>Waiting on the other device to send its key...</h1>
                     <p>A key? Yea, don't worry, it's just more of that nerd stuff - carry on</p>
                     </div>
                 : null
              }
              { (syncStatus === 'authorizing-key')
                 ? 
                 <div>
                 <h1>I'm now authorizing the other device...</h1>
                    <p>In just a moment, your other device will be able to use the identity for {syncUser}. 
                         I'm working my magic.</p>
                         </div>
                 : null

              }
              </div>
        }
        { (idError)
           ? 
           <div>
           <h1>An error has occurred!</h1>
              <p>{idError}</p>
              </div>
           : null        
        }
        <Button
            variant="danger"
            size="lg"
            onClick={() => handleRestart()}
            block>
              Try again!
        </Button>
     </div>
    )
  }  else {
    /**
      COMMENT:
      If a user on the remote device is logged in as a different user than the identity involved in the sync request,
      or is not logged-in at all, the user needs to switch to the identity that is the subject of the sync request. 
      This is as easy as clicking the switch button, entering a pin and the identity is switched or logged-in, if 
      there isn't a currentIdentity in state.
    */
    render (
      <div style={syncRemoteBox}>
        <Logo />
        <h1>Another device wants you to authorize its use of {syncUser}...</h1>
        <p>Please switch to the {syncUser} account, so that we can get started!</p>
        <Button variant="success" size="lg" onClick={() => handleIdSwitch()} block>Switch To {syncUser}</Button>
        <Button variant="danger" size="lg" onClick={() => handleReject()} block>Reject Request</Button>
        </div>
    )
  }
}
