import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { FAMail } from 'react-icons/fa'

export default function DirectMessageButton ({ user }) {
  return (
    <Link to={`/privateChat/new/${user}`}>
      <Button 
        variant="success"
        size="large">
        <FAMail /> Chat With {user}
      </Button>
    </Link>
  )
}