import React, { createContext, useState, useContext } from 'react'
import { generateIdError } from './IdErrorHandler'

const [ pin, setPin ] = useState()
const [ pinStatus, setPinStatus ] = useState(false)
const [ currentIdentity, setCurrentIdentity ] = useState()

const clearPin = () => {
  setPin()
  setPinStatus(false)
}
const pushPin = pin => {
  if (pin.length === 6) {
    setPin(pin)
    setPinStatus(true)
  }
  else generateIdError('Pin must be 6 characters')
}
const loginUser = username => {
  setCurrentIdentity(username)
}

export default  {
  pin,
  clearPin,
  pushPin,
  pinStatus,
  loginUser
}