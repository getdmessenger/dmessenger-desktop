/**
File: hooks/useIdentity.js
Author: Jared Rice Sr.
Description: The useIdentity hook makes certain state available throughout the entire dMessenger application. You can think of this state as an airplane, that can essentially fly to any destination (component, page, popup, etc) that renders something to the DOM. We simply wrap the application via App.js, with this context provider, so that the state can be retrieved within any child component, page, popup, etc., of the provider. This is crucial, so that identity-related state can be retrieved by any page, or component. 
*/

import React, { createContext, useState, useContext } from 'react'

const IdentityContext = createContext()
export const useIdentity = () => useContext(IdentityContext)

export function IdentityProvider ({children}) {
  const [ pin, setPin ] = useState()
  const [ currentIdentity, setCurrentIdentity ] = useState()
  const [ loginTime, setLoginTime ] = useState()
  const [ idError, setIdentityError ] = useState()
  const [ replicatedIdentity, updateReplicatedIdentity ] = useState()
  const [ deviceCode, setDeviceCode ] = useState()
  const [ deviceId, setDeviceId ] = useState()
  
  const clearPin = () => setPin()
  const clearDeviceCode = () => setDeviceCode()
  const pushDeviceId = id => setDeviceId(id)
  const pushPin = pin => setPin(pin)
  const loginUser = username => setCurrentIdentity(username)
  const generateIdError = err => setIdentityError(err)
  const clearIdError = () => setIdentityError()
  const logoutUser = () => setCurrentIdentity()
  const pushLoginTime = time => setLoginTime(time)

  return (
    <IdentityContext.Provider
      value={{
        pin,
        pushPin,
        clearPin,
        loginUser,
        logoutUser,
        currentIdentity,
        loginTime,
        pushLoginTime,
        replicatedIdentity,
        updateReplicatedIdentity,
        idError,
        generateIdError}}>
          {children}
     </IdentityContext.Provider>
  )
}