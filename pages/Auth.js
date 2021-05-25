import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Spinner } from 'react-bootstrap/Spinner'
import { Button } from 'react-bootstrap/Button'
import { useIdentity } from './../hooks/useIdentity'
import { identityExists, isAuthorized } from './../authentication/authHelpers'
import { Logo } from './../components/Logo'
import { loadingBox, notAuthorizedBox } from './../jss/pages/Auth'

export default function Auth () {
  const [ isAuthenticating, setStatus ] = useState(true)
  const [ isUnauthorized, setAuthStatus ] = useState(false)
  
  const { user } = useParams()
  const { currentIdentity, loginUser, pin } = useIdentity()
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
       if (currentIdentity) navigate('/home')
       if (!currentIdentity) {
         if (isAuthorized(user)) {
           if (!pin) {
             navigate(`/pin/${user}`)
           }  else {
             loginUser(user)
             navigate('/home')
           }
         } else {
           // user is not authorized, lets check if db even exists
           if (identityExists(user)) {
             // if it exists, user simply needs to authorize it - render page
             setStatus(false)
             setAuthStatus(true)
           }  else {
             // if db does not exist, default to login page, where it can be replicated from the master, wherever it is
             navigate('/login')
           }
         }
       }
     })()
  }, [currentIdentity])

  return (
      <div>
          <Logo />
          { (isAuthenticating)
             ? <div style={loadingBox}>
                 <Spinner
                   animation="border"
                   variant="danger"
                 />
                </div>
             : <div style={notAuthorized}>
                  <h2>You are not authorized to use this identity!</h2>
                  <p>This could be because your identity was created on a different device, like your phone. If you that is the case,                   you can use that device to authorize this one. Click below to get started. </p>
                  <Button
                    variant="warning"
                    size="lg"
                    onClick={() => navigate(`/sync/${user}`)}
                    block>
                      I Can Prove It's Me!
                  </Button>
                </div>
          }
      </div>
  )
}