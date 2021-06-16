/**
File: components/ReplyAlert.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the reply alert displayed above each message component, that is `inReplyTo` another message.  This clearly displays the message ID that the current message is `inReplyTo`, along with the user it is `inReplyTo`.
*/

import React from 'react'
import Alert from 'react-bootstrap'
import { useMessenger } from './../hooks/useMessenger'
import { replyBox, replyBubble } from './../jss/components/ReplyAlert'

export default function ReplyAlert () {
  const { replyingTo, setReplyingTo } = useMessenger()

  return (
   <div style={replyBox}>
    <a href={`${replyingTo.messageId}`}>
      <Alert variant="light">
        <Alert.Heading as="h6">
          In reply to <Link to={`/friend/${replyingTo.user}`}>@{replyingTo.user}</Link>
        </Alert.Heading>
        <Alert.Link href={`${replyingTo.messageId}`}>
          <p style={replyBubble}>{replyingTo.message}</p>
        </Alert.Link>
      </Alert>
    </a>
  </div>
  )
}