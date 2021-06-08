/** 
File: components/ChatSidebarItem.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component is used within the ChatSidebar and represents an individual item in the list (a public/private room or a private chat) that the user has joined. 
*/

import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap/Card'
import { RoomAvatar } from './RoomAvatar'
import { FriendAvatar } from './FriendAvatar'
import { sidebarItem } from './../jss/components/ChatSidebarItem'
import { useMessenger } from './../hooks/useMessenger'

export default function ChatSidebarItem ({ type, name, from, message, timestamp }) {
  const [ abbreviatedMessage, setAbbreviatedMessage ] = useState()
  const { selectedChat } = useMessenger()
  
  /** COMMENT
    Here we check to see if the `selectedChat` (held globally) matches the name of this item
    on the sidebar. If so, we will use this to determine the color of the actual card.
  */

  useEffect(() => {
    if (selectedChat === name) setActive(true)
    else setActive(false)
  }, [name])

  /** COMMENT
    Here we get the message that is passed to the item and abbreviate it. We then 
    store the abbreviated message in state under "abbreviatedMessage."
  */

  useEffect(() => {
    let abbMessage = message.substring(0, 31)
    setAbbreviatedMessage(abbMessage + '...')
  }, [message])

  return (
    <Link to={"/"+{type}+"/"+{name}}>
      <Card style={sidebarItem} className="mb-0 {(isActive) ? bg-light : bg-dark}">
        <Card.Body>
          <Card.Title>
            {(type === 'publicRoom' || type === 'privateRoom')
               ? <RoomAvatar roomName={name} type={type} />
               : <FriendAvatar user={name} />
            } {' '} {'@'}{name}
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{timestamp}</Card.Subtitle>
          <Card.Text><strong>@{from}:</strong>{' '} {abbreviatedMessage}</Card.Text>
        </Card.Body>
      </Card>
    </Link>
  )
}
