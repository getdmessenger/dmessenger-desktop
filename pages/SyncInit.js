import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from 'react-bootstrap/Button'
import SIEP from '@dwebid/simple-identity-exchange-protocol'
import pump from 'pump'
import dswarm from 'dswarm'
import { Logo } from './../components/Logo'
import { CreatePinPopup } from './../popups/CreatePinPopup'
import { EnterDeviceCodePopup } from './../popups/EnterDeviceCodePopup'
import { useIdentity } from './../services/Identity'
import { getIdKey } from './../authentication/loginHelpers'
import { getDb, isAuthorized } from './../authentication/authHelpers'
import { Identity } from './../services/Identity'
import { syncBox } from './../jss/pages/SyncInit'

export default function SyncInit () {
  const [ showCodePad, setShowCodePad ] = useState()
  const [ showPinPad, setShowPinPad ] = useState()
  const [ code, setCode ] = useState()
  const [ restart, setRestart ] = useState()
  const [ currentChannel, setCurrentChannel ] = useState()
  const [ currentMessage, setCurrentMessage ] = useState()
  
  const { syncStatus, 
             pushSyncStatus, 
             pin, 
             pushPin, 
             currentIdentity, 
             idError, 
             generateIdError } = useIdentity()

  const { user } = useParams()
  const navigate = useNavigate()
  const db = await getDb(user)

  const initiatorProtocolStream = new SIEP(true, {
    encrypt: true,
    noise: true,
    onhandshake () {
      initiatorProtocolStream.open(1, {
        user: user
      })
    },
    onverify (channel, message) {
      setCurrentChannel(channel)
      setCurrentMessage(message)
      setShowCodePad(True)
    },
    onreleaseseed (channel, message) {
      setCurrentChannel(channel)
      setCurrentMessage(message)
      setShowPinPad(true)
    },
    onclose () {
      handleError('Sync was aborted by the other device.')
    }
  })

  const getMasterKey = () => {
    db.get('!devices!master', (err, nodes) => {
      if (err) handleError(err)
      if (nodes) {
        let len = nodes.length - 1
        return nodes[len].value
      }
    })
  }

  const handleCode = value => {
    setCode(value)
    setShowCodePad(false)
    initiatorProtocolStream.prove(currentChannel, { secret: code })
    pushSyncStatus('verifying')
  }

  const handlePin = value => {
    pushPin(value)
    const id = new Identity(user)
    const seed = currentMessage.seed
    const encryptedSeed = id.encryptSeed(seed, pin)
    await id.storeSeed(encryptedSeed)
    setShowPinPad(false)
    pushSyncStatus('authorizing')
    const key = db.local.key
    initiatorProtocolStream.providekey(currentChannel, {
      identifier: "dwebid",
      diffKey: key
    })
    handleAuth()
  }

  const handleError = err => {
    pushSyncStatus()
    setShowCodePad(false)
    setShowPinPad(false)
    generateIdError(err)
    initiatorProtocolStream.destroy()
    setStreamDestroyed(true)
  }

  const handleAbort = () => {
    initiatorProtocolStream.destroy()
    pushSyncStatus()
    navigate('/start')
  }
  
  const handleAuth = () => {
    while (!isAuthorized()) {
      setTimeout( () => {
        console.log('waiting on master to authorize')
      }, 3000)
    }
    initiatorProtocolStream.destroy()
    navigate('/sync/complete')
  }
  
  const handleRestart = () => {
    initiatorProtocolStream.destroy()
    pushSyncStatus()
    setRestart(true)
  }
  
  useEffect(() => {
    if (currentIdentity === user) navigate('/home')
  }, [])

  // Connect with remote device, using device's master device ID and pump in protocol stream.
  // When restart's state changes, this is destroyed and recreated. So that the connection process starts over.
  useEffect(() => {
    (async () => {
      let key = getMasterKey()
      swarm.join(key, {
        lookup: true,
        announce: true
      })
      swarm.on('connection', (socket, info) => {
        pump(socket, initiatorProtocolStream, socket)
        pushSyncStatus('connected')
      })
      return swarm.leave(key)
    })()
  }, [restart])

  // Swarm/replicate the identity document
  useEffect(() => {
    (async () => {
      let key = await getIdKey()
      swarm.join(key, {
        lookup: true,
        announce: true
      })
      swarm.on('connection', (socket, info) => {
        pump(socket, db.replicate({ live: true }), socket)
      })
      return swarm.leave(key)
     })()
  }, [restart])

  render (

    <div>
       <Logo />
       
            <EnterDeviceCodePopup
              onComplete={value => handleCode(value)}
              show={showCodePad}
            />

            <CreatePinPopup
              onComplete={value => handlePin(value)}
              show={showPinPad}
            />

    <div style={syncBox}>
      <Logo />
      { (!syncStatus)
         ? <div><h1> Initializing connection... </h1>
            <p>I am attempting to connect to the master device associated with your identity. I appreciate your patience.</p>
            </div>
         :<div> {(syncStatus === 'connected')
               ? <div> <h1>Connected to master device...</h1>
                  <p>I have connected to the master device and I'm waiting on it to send me instructions.</p>
                  </div>
               : null
           }

           { (syncStatus === 'verifying')
               ? <div> <h1>Waiting on master to verify code...</h1>
                  <p>I am waiting on the master to verify the code you just entered.</p> </div>
               : null
           }

           { (syncStatus === 'authorizing')
               ?<div> <h1>Waiting on the master to authorize this device.</h1>
                  <p>I am now waiting on the master to authorize this device.</p>
                  </div>
               : null
            
           }
           <Button
              variant="danger"
              size="lg"
              onClick={() => handleAbort()}
              block>
                Abort Sync
           </Button>
           </div>
     }

     { (idError)
         ?<div> <h1>An error occurred!</h1>
            <p>{idError}</p>
            <Button
               variant="danger"
               size="lg"
               onClick={() => handleRestart()}
               block>
                 Try Again
            </Button>
            </div>
         : null  
     }
   </div>

   </div>
  )
}