/**
File: hooks/useIdentity.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: The `useIdentity` hook exports the IdentityProvider, which allows us to access the pin, currentIdentity and other import details for a specific user, throughout any of our React components. We simply import the useIdentity context into any of the component files we need to utilize any of the state set below. There are also exported functions for setting or clearing specific state related to a user's identity. This also holds state related to identity-related errors that occur throughout the application.
*/

import React, { createContext, useState, useContext } from 'react'

const IdentityContext = createContext()
export const useIdentity = () => useContext(IdentityContext)

export function IdentityProvider ({children}) {
  const [ pin, setPin ] = useState()
  const [ currentIdentity, setCurrentIdentity ] = useState()
  const [ lt, setLoginTime ] = useState()
  const [ idError, setIdentityError ] = useState()
  
  const clearPin = () => setPin()

  const pushPin = pin => {
    if (pin.length === 6) {
      setPin(pin)
    }  else {
      generateIdError('Pin must be 6 numbers')
    }
  }

  const loginUser = username => setCurrentIdentity(username)

  const generateIdError = err => setIdentityError(err)

  const clearIdError = () => setIdentityError()

  const logoutUser = () => setCurrentIdentity()

  return (
    <IdentityContext.Provider 
      value={{pin, pushPin, clearPin, loginUser, lt, setLoginTime, currentIdentity, logoutUser, idError, generateIdError}}
    >
      {children}
    </IdentityContext.Provider>
  )
}