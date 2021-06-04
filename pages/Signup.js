/**
File: pages/Signup.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the component that makes up the signup page for dMessenger.
*/

import crypto from 'crypto'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form } from 'react-bootstrap/Form'
import { Alert } from 'react-bootstrap/Alert'
import { Button } from 'react-bootstrap/Button'
import { DWebIdentity } from '@dwebid/core'
import { IdQuery } from '@dwebid/query'
import { Identity } from './../services/Identity'
import { Logo } from './../components/Logo'
import { CreatePinPopup } from './../popups/CreatePinPopup'

export default function Signup () {
  const [ usernameChosen, setUsernameChosen ] = useState(false)
  const [ usernameAvailable, setUsernameAvailable ] = useState(false)
  const [ recoveryCode, setRecoveryCode ] = useState()
  const [ regData, setRegData ] = useState()
  const [ isLoading, setLoadingStatus ] = useState()
  const [ registered, setRegistered ] = useState()

  const { 
    setPin,
    pin,
    idError,
    generateIdError,
    currentIdentity,
    loginUser,
    togglePinPad,
    pinPad  } = useIdentity()

  const navigate = useNavigate()

  /*
    COMMENT:
      This sets the loading status to true, which makes the check availability button unusable during the search.
      It then queries the DHT for the username using the @dwebid/query library. If available, it sets the 
      usernameAvailable state to true, and the usernameTaken state to false. It then sets the loading status
      to false. If the username is taken, the opposite happens. A lot in the UI depends on these state variables.
      If a username is available, the button changes from "Check Availability" to "Create A Pin". It also generates
      an alert on whether or not the username is available or not.
  */

  const handleSearch = () => {
    setLoadingStatus(true)
    const query = new IdQuery(username)
    const available = query.checkAvailability()
    if (available) {
      setUsernameAvailable(true)
      setUsernameTaken(false)
      setLoadingStatus(false)
    }  else {
      setUsernameAvailable(false)
      setUsernameTaken(true)
      setLoadingStatus(false)
    }
  }

  /* 
    COMMENT:
    As the value changes in the form box, the state for "username" is updated. When a user checks for the
    availability of a username and usernameAvailable or usernameTaken is set to true/false, and then the 
    user decides to search again, by changing the value within the form box, we also set usernameAvailable
    and usernameTaken both to false, so that the UI doesn't error out. There may be a different way of 
    doing this.
  */

  const handleUsernameChange = value => {
    setUsernameAvailable(false)
    setUsernameTaken(false)
    setUsername(value)
  }

  /*
   COMMENT:
     When clicking "Create A Pin >", on the completion of pin creation, the handlePreReg() function is 
     initiated. This places the value entered within the "pin" state, hides the pin pad, and then 
     sets the usernameChosen state to true. This changes the UI from the form view, to showing the user
     their recovery code.
  */

  const handlePreReg = value => {
    setPin(value)
    togglePinPad()
    setUsernameChosen(true)
  }

  /*
   COMMENT:
     This function is initiated upon registration. A recovery code is generated and stored in the 
     recoveryCode state and then the account is registered on the DHT.
  */
  const handleRegistration = async () => {
    const id = new DWebIdentity(username)
    const idService = new Identity(username)
    const randomBytes = crypto.randomBytes(32)
    const mnemonic = await id.passwordToMnemonic(randomBytes)
    setRecoveryCode(mnemonic)
    id.register()
       .then(d => {
         const { data, secretKey } = d
         const genSalt = storeSalt(genSalt)
         idService.storeSalt(genSalt)
         const seed = await idService.passwordToSeed(recoveryCode)
         const encryptedSeed = idService.encryptedSeed(pin, seed)
         idService.storeSeed(encryptedSeed)
         const encryptedSecretKey = idService.encryptSecretKey(pin, secretKey)
         await idService.addIdentitySecret('default', encryptedSecretKey)
         await idService.addIdentityToPrivate(username, data)
         setRegData({
           salt: genSalt,
           recoveryCode: recoveryCode,
           publicKey: data.publicKey,
           secretKey: secretKey,
           seed: seed
         })
         setRegistered(true)
       })
       .catch(err => handleError(err))
  }

  // const handleLogin = () => {
  //   clearAllState()
  //   loginUser(username)
  // }

  const handleLogin = () => {
    loginUser(username)
    clearAllState()
    navigate(`/onboarding`)
  }

  const handleError = err => {
    clearAllState()
    generateIdError(err)
  }

  const clearAllState = () => {
    setUsernameChosen(false)
    setUsernameAvailable(false)
    setLoading(false)
    setRegistered(false)
    setRegData()
    setPin()
    setDeviceCode()
  }

  // useEffect(() => {
  //   if (currentIdentity) navigate(`/auth/${currentIdentity}`)
  // }, [currentIdentity])

  useEffect(() => {
    if (currentIdentity) navigate(`/auth/${currentIdentity}`)
  }, [])

  if (!registered) {
    return (
        <>
      <CreatePinPopup
        onComplete={value => handlePreReg(value)}
        show={pinPad}
      />
      { (!usernameChosen)
          ? <div style={chooseUsernameBox}>
            <Logo />
             <h1>Choose a PeepsID</h1>
             { (usernameAvailable || usernameTaken)
                 ? <Alert
                     variant={(usernameAvailable) ? success : (usernameTaken) ? danger : null }
                     dismissable>
                       { (usernameAvailable)
                           ? {username} +'is available!'
                           : (usernameTaken)
                               ? {username} + 'is taken! Try again'
                           : null
                       }
                    </Alert>
                 : null
             }
             <Form>
               <InputGroup className="mb-2 mr-sm-2">
                 <InputGroup.Prepend>
                   <InputGroup.Text>@</InputGroup.Text>
                 </InputGroup.Prepend>
                 <FormControl
                   onChange={value => handleUsernameChange(value)}
                   size="lg"
                   placeholder="yourname"
                 />
              </InputGroup>
              </Form>
              { (username)
                  ? <Button
                      variant={(!usernameAvailable) ? "primary" : "success"}
                      onClick={(!usernameAvailable) ? {handleSearch} : {togglePinPad}}
                      type="submit"
                      block>
                          {(isLoading) ? disabled : null }
                          { (isLoading)
                              ? 'Searching...'
                              :  (!usernameAvailable) ? 'Check Availability' : 'Create A Pin >'}
                      </Button>
                  : null
                }
            </div>
          : <div style={deviceCodeBox}>
              <Logo />
              <h1>Your device recovery code</h1>
              <p>IMPORTANT: This is a recovery code that can be used to recover your identity, in the event that you lose your
                  device. Remember, dMessenger is not powered or owned by anyone and you control your own
                  own identity. The only way to recover an identity, is if you have its recovery code. Please keep
                  this in a safe place.</p>
              <h5 className="recoveryCode">{recoveryCode}</h5>
              <Button
                variant="success"
                size="lg"
                onClick={handleRegistration}
                block>
                  Register {username}
              </Button>
           </div>
      }
      </>
    )
  }  if (registered) {
    return (
      <div style={successfulRegBox}>
        <Logo />
         <h1>{username} was successfully registered!</h1>
         <p>Below, you will find important information regarding your PeepsID. 
              It's important that you print this information and keep it in a safe place, 
              just in case you lose access to your identity in the future.</p>
         <p><strong>Salt:</strong> {regData.salt}</p>
         <p><strong>Recovery Code:</strong> {recoveryCode} </p>
         <p><strong>Public Key:</strong> {regData.publicKey}</p>
         <p><strong>Secret Key:</strong> {regData.secretKey}</p>
         <p><strong>Username:</strong> {regData.username}</p>
         <Button
           variant="success"
           size="lg"
           onClick={handleLogin}
           block>
             Log Me In!
         </Button>
      </div>
    )
  }
  if (idError) {
    return (
      <div style={idErrorBox}>
        <h1>An error occurred!</h1>
        <p>{idError}</p>
      </div>
    )
  }
}