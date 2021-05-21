import React, { useState } from 'react'

const [ idError, setIdError ] = useState()

function generateIdError (err) {
  setIdError(err)
}

function clearIdError () {
  setIdError()
}

export default  {
  idError,
  generateIdError,
  clearIdError
}