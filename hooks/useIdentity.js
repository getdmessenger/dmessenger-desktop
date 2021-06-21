/**
File: hooks/useIdentity.js
Author: Jared Rice Sr.
Description: The useIdentity hook makes certain state available throughout the entire dMessenger application. You can think of this state as an airplane, that can essentially fly to any destination (component, page, popup, etc) that renders something to the DOM. We simply wrap the application via App.js, with this context provider, so that the state can be retrieved within any child component, page, popup, etc., of the provider. This is crucial, so that identity-related state can be retrieved by any page, or component. 
*/

import React, { createContext, useReducer, useState, useContext } from 'react'

const IdentityContext = createContext()
export const useIdentity = () => useContext(IdentityContext)

export function IdentityProvider ({ children }) {
  const [ pin, setPin ] = useState()
  const [ currentIdentity, setCurrentIdentity ] = useState()
  const [ loginTime, setLoginTime ] = useState()
  const [ idError, setIdentityError ] = useState()
  const [ replicatedIdentity, updateReplicatedIdentity ] = useState()
  const [ deviceCode, setDeviceCode ] = useState()
  const [ showCode, setShowCode ] = useState()
  const [ syncUser, setSyncUser ] = useState()
  const [ deviceId, setDeviceId ] = useState()
  const [ syncAccepted, setSyncAcceptance ] = useState()
  const [ seed, setSeed ] = useState()
  const [ hasSeed, setHasSeed ] = useState()
  const [ syncStatus, setSyncStatus ] = useState()
  const [ destroySync, setDestroySync ] = useState()
  const [ idSwitch, setIdSwitch ] = useState()
  const [ pinPad, togglePinPad ] = useReducer(pinPad => !pinPad, false)
  const [ switchPopup, toggleSwitchPopup ] = useReducer(switchPopup => !switchPopup, false)

  const clearPin = () => setPin()
  const clearDeviceCode = () => setDeviceCode()
  const pushPin = pin => setPin(pin)
  const loginUser = username => setCurrentIdentity(username)
  const generateIdError = err => setIdentityError(err)
  const clearIdError = () => setIdentityError(err)
  const logoutUser = () => setCurrentIdentity()
  const pushLoginTime = time => setLogin(time)
  const pushDestroySync = value => setDestroySync(value)
  const pushSyncAcceptance = value => setSyncAcceptance(value)
  const pushSeed = seed => setSeed(seed)
  const pushHasSeed = value => setHasSeed(value)
  const clearSeed = () => setSeed()
  const pushSyncStatus = status => setSyncStatus(status)
  const pushIdStatus = idObject => setIdSwitch(idObject)
  const clearSyncStatus = () => setSyncStatus()
  const resetSyncState = () => {
    clearSeed()
    clearPin()
    clearSyncStatus()
    setDestroySync()
    setSyncAcceptance(false)
    setIdentityError()
  }
  const resetSyncStateFull = () => resetSyncState()

  return (
    <IdentityContext.Provider
      value={{pin,
                  currentIdentity,
                  loginTime,
                  idError,
                  replicatedIdentity,
                  deviceCode,
                  showCode,
                  syncUser,
                  deviceId,
                  syncAccepted,
                  seed,
                  hasSeed,
                  syncStatus,
                  destroySync,
                  idSwitch,
                  pinPad,
                  switchPopup,
                  togglePinPad,
                  toggleSwitchPopup,
                  clearPin,
                  clearDeviceCode,
                  pushPin,
                  loginUser,
                  generateIdError,
                  clearIdError,
                  logoutUser,
                  pushLoginTime,
                  pushDestroySync,
                  pushSyncAcceptance,
                  pushSeed,
                  pushHasSeed,
                  clearSeed,
                  pushSyncStatus,
                  pushIdSwitch,
                  clearSyncStatus,
                  resetSyncState,
                  resetSyncStateFull,
                  setDeviceId,
                  setDeviceCode}}>
       {children}
    </IdentityContext.Provider>
  )
}