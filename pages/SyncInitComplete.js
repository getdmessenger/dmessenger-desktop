import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap/Button'
import { Logo } from './../components/Logo'
import { useIdentity } from './../hooks/useIdentity'
import { successBox } from './../jss/pages/SyncComplete'

export default function SyncInitComplete () {
  const { currentIdentity } = useIdentity()
  const navigate = useNavigate()
  
  render (
    <div style={successBox}>
      <Logo />
      <h1>ID Sync Was Successful!</h1>
      <p>Now you can get started with using your PeepsID on this device! Click below to get started!</p>
      <Button
        variant="success"
        size="xl"
        onClick={() => navigate(`/auth/${currentIdentity}`)}
        block>
          Login With {currentIdentity}
      </Button>
    </div>
  )
}