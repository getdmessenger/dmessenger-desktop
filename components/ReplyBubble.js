/**
File: components/ReplyBubble.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: If a message is in reply to another message, the ReplyButton component is rendered above the Message containing the replied to message and the replied to user.
*/

import React, { useState, useEffect } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function ReplyBubble ({ from, message, key, timestamp }) {
  return (
    <Link href={`${key}`}>
      <p>In reply to: <strong>@{from}</strong> at {timestamp}</p>
      <Card body>{message}</Card>
    </Link>
  )
}