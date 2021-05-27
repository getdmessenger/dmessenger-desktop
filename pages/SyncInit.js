/**
File: pages/SyncInit.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This page within the application is found at `/sync/${username}` and handles the initiation of the sync process, for a specific identity. The goal of the sync process, is to find the master device in the user's identity document, locate the device ID on dWeb's DHT, make a connection with the device and start a SIEP (Simple Identity Exchange Protocol)-based communication with that device, so that the following can occur:
1. The initiating device can prove to the master device that is has possession of the master device by sending a code that the master device displays.
2. Receive the seed from the master device, that is used to encrypt all secret keys within the identity document
3. Be authorized by the master device to write to the identity document.

The initiator below, is asked to create a pin number, which is used to encrypt the received seed, and store in the user's private database, just as it is on the master device. The only difference being, the seed can be encrypted with two different pins, on both devices, or the same pin, it's totally up to the user. Once authorized, the user is told they have been authorized. At any point the user can exit the process by clicking the "Stop Sync" button at the bottom of the screen, which will destroy the protocol-based communication with the master device (destroy the pipe on both ends).
*/

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from 'react-bootstrap/Button'
import SIEP from '@dwebid/simple-identity-exchange-protocol'
import pump from 'pump'
import dswarm from 'dswarm'
import { Logo } from './../components/Logo'
import { CreatePinPopup } from './../popups/CreatePinPopup'
import { EnterDeviceCodePopup } from './../popups/EnterDeviceCodePopup'
import { getIdKey } from './../authentication/loginHelpers'
import { getDb, isAuthorized } from './../authentication/authHelpers'
import { useIdentity } from './../hooks/useIdentity'
import { Identity } from './../services/Identity'
import { syncBox } from './../jss/pages/SyncInit'

export default function SyncInit () {
  const [initializing, setInitializing] = useState(true)
  const [connected, setConnected] = useState(false)
  const [showCodePad, setShowCodePad] = useState(false)
  const [showPinPad, setShowPinPad] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [authorizing, setAuthorizing] = useState(false)
  const [code, setCode] = useState()
  const [currentChannel, setCurrentChannel] = useState()
  const [currentMessage, setCurrentMessage] = useState()

  const { pin, pushPin, currentIdentity, generateIdError, idError } = useIdentity()
  const { user } = useParams()
  const navigate = useNavigate()
  const swarm = dswarm()
  const db = getDb(user)

  const initiatorProtocolStream = new SIEP(true, {
    encrypted: true,
    noise: true,
    onverify (channel, message) {
      setCurrentChannel(channel)
      setCurrentMessage(message)
      setShowCodePad(true)
    },
    onreleaseseed (channel, message) {
      setCurrentChannel(channel)
      setCurrentMessage(message)
      setShowPinPad(true)
    }
  })

  const getMasterKey = () => {
    db.get('!devices!master', (err, nodes) => {
      if (err) generateIdError('Could not find the master device in the identity document')
      if (nodes) {
        let len = nodes.length
        let nP = len - 1
        return resolve(nodes[nP].value)
      }
    })
  }

  const handleCode = (value) => {
    setCode(value)
    setShowCodePad(false)
    initiatorProtocolStream.prove(currentChannel, {
      secret: code
    })
    setConnected(false)
    setVerifying(true)
  }

  const handlePin = (value) => {
    pushPin(value)
    const id = new Identity(user)
    const seed = currentMessage.seed
    const encryptedSeed = id.encryptSeed(seed, pin)
    await id.storeSeed(encryptedSeed)
    setShowPinPad(false)
    setVerifying(false)
    setAuthorizing(true)
    const key = db.local.key
    initiatorProtocolStream.providekey(currentChannel, {
      identifier: "dwebid",
      diffKey: key
    })
    handleAuth()
  }

  const handleAuth = () => {
    while (!isAuthorized()) {
      setTimeout(() => {
        console.log('Waiting for master to authorize')
      }, 3000)
    initiatorProtocolStream.destroy()
    navigate('/sync/complete')
    }
  }

  const handleAbort = () => {
    initiatorProtocolStream.destroy()
    navigate('/login')    
  }

  useEffect( () => {
    if (currentIdentity === user) navigate('/home')
  }, [])

  useEffect(() => {
    (async () => {
      let key = getMasterKey()
      swarm.join(key, {
        lookup: true,
        announce: true
      })
      swarm.on('connection', (socket, info) => {
        pump(socket, initiatorProtocolStream, socket)
        setConnected(true)
      })
      return swarm.leave(key)
    })()
  }, [])

  useEffect(() => {
    (async () => {
      let key = await getIdKey()
      swarm.join(key, {
        lookup: true,
        announce: true
      })
      swarm.on('connection', (socket, info) => {
        pump(socket, db.replicate({live: true}), socket)
      })
      return swarm.leave(key)
    })()
  }, [])

  render (
    <div style={syncBox}>
      <Logo />
      <CreatePinPopup
        onComplete={(value) => handlePin(value)}
        show={showPinPad}
      />
      <EnterDeviceCodePopup
        onComplete={(value) => handleCode(value)}
        show={showCodePad}
      />

      { (idError)
         ? 
         <div><h1>An error occurred!</h1>
           <p>{idError}</p>
           </div>
         : null
      }
      { (initializing)
           ?<div> <h1> Initializing connection... </h1>
             <p> I am attempting to connect to the master device associated with your identity. I appreciate your patience.</p>
             </div>
           : null
      }
      { (connected)
         ?<div> <h1>Connected to master device...</h1>
            <p>I have connected to the master device and I'm waiting on it to send me instructions.</p>
            </div>
         : null
      }
      { (verifying)
         ? <div> <h1>Waiting on master to verify code...</h1>
             <p>I am waiting on the master to verify the code you just entered.</p>
             </div>
         : null
      }
      { (authorizing)
        ? 
        <div><h1>Waiting on the master to authorize this device...</h1>
           <p>I am now waiting on the master to authorize this device</p>
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
  )
}