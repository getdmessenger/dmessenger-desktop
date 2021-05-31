import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Spinner } from 'react-bootstrap/Spinner'
import { Button } from 'react-bootstrap/Button'
import { useIdentity } from './../hooks/useIdentity'
import { identityExists, isAuthorized } from './../authentication/authHelpers'
import { confirmPin } from './../authentication/confirmPin'
import { Logo } from './../components/Logo'
import { ConfirmPinPopup } from './../popups/ConfirmPinPopup'
import { loadingBox, 
             notAuthorizedBox, 
             authErrorBox } from './../jss/pages/Auth'

export default function Auth () {
  const [ isAuthenticating, setStatus ] = useState(true)
  const [ isUnauthorized, setAuthStatus ] = useState(false)

  const { user } = useParams
  const {
    currentIdentity,
    loginUser,
    pin,
    pinPad,
    togglePinPad,
    generateIdError,
    clearIdError
  } = useIdentity()

  const navigate = useNavigate()

  useEffect(() => {
    (async () => {

        // If the currentIdentity is the same as the user in the URL, (auth/url), simply forward to the home screen.

      if (currentIdentity === user) {
        navigate('/home')
      }

        // If there isn't a currentIdentity and the user is an authorized writer within the ID document
        // show the pin pad, to verify their auth details.

      if (!currentIdentity) {
        if (isAuthorized(user)) {
          togglePinPad()
        }  else {

          /**
           COMMENT 
           If the identity exists locally but the user is not an authorized writer within 
           the ID document, set isUnauthorized to true, so that user can begin sync process with 
           master device to gain the required authorization.
           */

          if (identityExists(user)) {
            setStatus(false)
            setAuthStatus(true)

          /**
           COMMENT:
           If the identity document does not exist locally, then the user needs to go through the entire
           login process, which first replicates the ID document to their device and then will forward the 
           user to the sync process. 
          */
          }  else {
            navigate('/login/`${user}`')
          }
        }
      }
    })()
  }, [currentIdentity])

  const handlePin = value => {
    /*
      COMMENT
      If the pin is confirmed, hide the pin pad, and login the user. This should refresh useEffect
      (currentIdentity === user) and will forward user to /home.
    */

    if (confirmPin(value)) {
      togglePinPad()
      loginUser(user)

    /*
      COMMENT
      If the pin is not confirmed, remove the pin pad, and issue an error.
      This will refresh the UI to show the error, and a user can click the 
       "Try again" button, which will initiate the handleDoOver() function,
      which resets the UI state and shows the pin pad again.
    */

    }  else {
      togglePinPad()
      handleError('You entered an incorrect pin. Try again!')
    }
  }

  const handleDoOver = () => {
    // reset the UI state, so that the UI goes back to the way it was when the page was first loaded.

    setStatus(true)
    setAuthStatus(false)

    // Clear ID error, so that on handleDoOver, the UI does not show the previous error
    clearIdError()

    // Show the pin pad
    togglePinPad()
  }

  const handleError = err => {
    // generate an error
    generateIdError(err)
  }

  if (!idError) {
    return (
      <>
      <Logo />
      <ConfirmPinBox
        onComplete={handlePin}
        onClick={() => navigate('/start')}
        show={pinPad}
        user={user}
      />

      // While isAuthenticating = true, show the loading spinner
      { (isAuthenticating)
          ?  <div style={loadingBox}>
               <Spinner
                 animation="border"
                 variant="danger"
               />
             </div>
  
             // If isUnauthorized equals true, let the user know they need authorization 
             // and forward to sync process.

          :  <div style={notAuthorizedBox}>
                <h2>You are not authorized to use this identity!</h2>
                <p>This could be because your identity was created on a different device, like your phone.
                     If that is the case, you can use that device to authorize this one. Click below to get started.</p>
                <Button
                  variant="warning"
                  size="lg"
                  onClick={() => navigate(`/sync/${user}`)}
                  block>
                    I Can Prove It's Me
                </Button>
              </div>
      }
      </>
    )
     // On error, the UI should show the error. The only error on this page, is the entering of an
     // incorrect pin.
  }  
  else {
    return (
      <div style={authErrorBox}>
        <Logo />
        <h1>Wrong Pin!</h1>
        <p>{idError}</p>
        <Button
          variant="warning"
          size="lg"
          onClick={handleDoOver}
          block>
            Try Again!
        </Button>
     </div>
    )
  }
}