/**
File: pages/LoginUser.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This page is at `/login/${username}` when using the application and is responsible for locating and downloading a user's identity document, related to the username they typed in at `/login` (they arrive on this page from /login after typing in their username there, since /login/ allows a user to type in the username of the identity they're attempting to use and then forwards the user to this page using that username as a parameter (/login/username). It's important to note that this login process is only used when a user's identity does not already exist on the device they're using. For example, at /start/ (the first page a user sees when using dMessenger), if they have used dMessenger before, they will see the identities they have been authorized to use in a dropdown menu and can simply select one and can immediately begin using dMessenger without any sort of password authentication. For those who want to use dMessenger on a new device, they will need to get one of their other devices to authorize them to use their identity document, hence the login process. Login.js is the beginning of that process and this file continues that process. Once the identity document has been downloaded at this step, a user is forwarded to `/sync/${username}` (pages/SyncInit.js), where a user can use one device to authorize another, so that their identity can be used on both devices. 
*/

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap/Button'
import { Spinner } from 'react-bootstrap/Spinner'
import { getIdKey, initAndCheckId } from './../authentication/loginHelpers'
import { getIdentityInstance } from './../identity/getIdentityInstance'
import { Logo } from './../components/Logo'
import { useIdentity } from './../hooks/useIdentity'
import { loginBox } from './../jss/pages/LoginUser'

export default function LoginUser () {
  const [ isLoading, setLoadingStatus ] = useState(true)
  const [ isReplicated, setReplicationStatus ] = useState()
  
  const { user } = useParams()
  const { currentIdentity, replicatedIdentity, updateReplicatedIdentity } = useIdentity()
  
  useEffect( () => {
    if (replicatedIdentity) navigate(`/sync/${user}`)
    if (currentIdentity === user) navigate('/home')
  }, [])

  useEffect(() => async () => {
      const racePromises= ()=> {
        const initIdPromise = new Promise((resolve, reject) => {
          const idKey = await getIdKey(username)
          const id = await getIdentityInstance(username ,{key: idKey})
          await id.open()
          while(!id.doesDefaultExist) {
            console.log('Replicating identity')
          }
          return resolve(true)
        })
        const timeoutPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            return resolve(false)
          }, 60000)
        })
        const result = await Promise.race([initIdPromise, timeoutPromise])
        return result
      }
      const theRace = await racePromises()
      if (theRace) {
        updateReplicatedIdentity(true)
        setReplication(true)
        setLoadingStatus(false)
      }  else {
        setReplicationStatus(false)
        setLoadingStatus(false)
      }
  }, [])

  return (
      <div>
    <Logo />
    <div style={loginBox}>
       {/* While the identity document is being searched for, render the loading screen below: */}
      { (isLoading)
           ? 
           <div>
               <h4>Looking for your identity, somewhere in the Universe...</h4>
              <p>Please wait while we retrieve your identity from some of your friends
                   who really care about your existence, apparently.</p>
              <Spinner
                animation="border"
                variant="primary"
              />
          </div>
           // Once loading is finished, we either found it, or we didn't

           :  (!isReplicated)

                  // If the identity document isn't found, render the following:

                  ? 
                  <div><h4> We were unable to locate {user}
                  </h4>
                     <p>Does <b>{user}</b> actually exist? If so, it might just be an accident that we
                          were unable to find {user}'s document. In that case, click "Try again" below 
                          and I'll see if I can locate you.</p>
                     <Button
                       variant="danger"
                       size="lg"
                       onClick={() => navigate(`/login/${user}`)}
                       block>
                         Try again!
                      </Button>
                      <Button
                        variant="warning"
                        size="lg"
                        onClick={() => navigate('/login')}
                        block>
                          Change Username
                      </Button>
                      </div>

                   // If the identity is found, render the following:

                   : <div><h4>Your identity has been located.  You do exist, but...</h4>
                     <p>You created this identity on another device, which means the device you're holding
                           needs permission to use your identity. This will only take a few seconds and is totally
                           a one-time kind of thing.</p>
                     <Button
                       variant="success"
                       size="lg"
                       onClick={() => navigate(`/sync/${user}`)}
                       block>
                         I'm totally ready!
                     </Button>     
                     </div>           
             }      
    </div>
    </div>
  )
}