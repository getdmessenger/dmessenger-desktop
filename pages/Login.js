import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form } from 'react-bootstrap/Form'
import { Button } from 'react-bootstrap/Button'
import { useIdentity } from './../hooks/useIdentity'
import { Logo } from './../components/Logo'
import { loginBox } from './../jss/pages/Login'
import { checkAvailability } from './../authentication/loginHelpers'

export default function Login () {
  const [ username, setUsername ] = useState()
  const [ error, setError ] = useState()
 
  const { currentIdentity } = useIdentity()
  const navigate = useNavigate()
 
  const handleLogin = username => {
    if (checkAvailability(username))
      setError('The PeepsID has not been registered yet. Please create it')
    else
      navigate(`/login/${user}`)
  }

  const handleChange = event => {
    setUsername(event.target.value)
  }

  useEffect(() => {
    // check is user is already logged-in
    if (currentIdentity) navigate(`/auth/${currentIdentity}`)
  }, [])

  return (
    <div style={loginBox}>
      <Logo />
      <Form>
        {(error) ? <Form.Text id="loginError"> {error} </Form.Text> : null}
        <Form.Label htmlFor="peepsid">PeepsID</Form.Label>
        <Form.Control
          placeholder="Enter your PeepsID..."
          onChange={handleChange}
          size="lg"
        />
        <Form.Text id="peepsIdHelpBlock" muted>
          Your PeepsID must be registered and existent on another device. If you have not created a PeepsId,
          you can do so by clicking "Create A PeepsID" below.
        </Form.Text>
        <Button
          variant="success"
          type="submit"
          size="lg"
          onClick={() => handleLogin(username)}
          block>
            Login
        </Button>
        <Button
          variant="primary"
          type="button"
          size="lg"
          onClick={() => navigate('/signup')}
          block>
            Create A PeepsID
        </Button>
     </Form>
    </div>
  )
}
