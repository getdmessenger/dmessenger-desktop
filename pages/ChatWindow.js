/**
File: components/ChatWindow.js
Author: Jared Rice Sr. <jared@peepsx.com> 
Description: This displays the Chat window, which displays the messages for a particular public room, private room or private chat.
*/

import React, { useState } from 'react'
import { Query } from '@neutrondb/view-query'
import collect from 'collect-stream'
import level from 'leveldb'
import { Button } from 'react-bootstrap/Button'
import { useMessenger } from './../hooks'
import { getOldestTimestamp } from './../helpers/roomHelpers'
import { Message, SendMessage } from './'

export default function ChatWindow ({ name, type }) {
  const [ messages, setMessages ] = useState()
  const [ earliestTimestamp, setEarliestTimestamp ] = useState()
  const [ pastEarliestTimestamp, setPastEarliestTimestamp ] = useState()
  const [ queryStatus, setQueryStatus ] = useState()
  const [ pastPublicMessages, setPastPublicMessages ] = useState()
  
  const {
    publicRoomMessages,
    privateRoomMessages,
    privateChatMessages
  } = useMessenger()
 
  const handleLoadMore = () => {  
    // get milliseconds for 10 minutes
    let tenMinInMs = 600000
    setPastEarliestTimestamp(earliestTimestamp)
    // load all messages from ten minutes earlier
    setEarliestTimestamp(earliestTimestamp - tenMinInMs)    
  }

  useEffect(() => {
    if (type === 'publicRoom') {
      let mArray = publicRoomMessages.filter(x => x.name === name)
      setMessages(...mArray)
      let oldestTimestamp = getOldestTimestamp(messages)
      setPastEarliestTimestamp(oldestTimestamp)
      setEarliestTimestamp(oldestTimestamp)
      setQueryStatus(false)
    }
  }, [])

  const editPastPost = (msg) => {
    const without = pastPublicMessages.filter(x => x.messageId !== msg.messageId)
    without.push(msg)
    const sort = without.sort((a,b) => a.timestamp > b.timestamp)
    setPastPublicMessages(sort)
  }

  const deletePastPost = (msg) => {
    const new_ = pastPublicMessages.filter(x => x.messageId !== messageId)
    const sort = new_.sort((a,b) => a.timestamp > b.timestamp)
    setPastPublicMessages(sort)
  }

  useEffect(() => {
    (async () => {
       if (type === 'publicRoom' && queryStatus) {
         const base = await getDb(name)
         const db = level(`/tmp/dmessenger/messages/${type}/${name}`)
         const indexes = [
           { 
             key: 'log',
             value: ['value', 'timestamp']
           },
           {
             key: 'typ',
             value: [
               ['value', 'type'],
               ['value', 'timestamp']
             ]
           }
         ]
         const validator = msg => {
           if (!messageLegit(msg.message, msg.signature, msg.username)) return null
           return msg
         }
         base.use('query', Query(db, { indexes, validator }))
         const query = [{
           $filter: {
             value: {
               type: 'chat-message',
               timestamp: { $gte: pastEarliestTimestamp, $lte: earliestTimestamp }
             }
           }
         }]
         const queryDeleted = [{
           $filter: {
             value: {
               type: 'deleted-message',
               timestamp: { $gte: pastEarliestTimestamp, $lte: earliestTimestamp }
             }
           }
         }]
         const queryEdited = [{
           $filter: {
             value: {
               type: 'edited-message',
               timestamp: { $gte: pastEarliestTimestamp, $lte: earliestTimestamp }
             }
           }
         }]

         base.ready('query', () => {
           collect(base.api.query.read({query}), (err, msgs) => {
             let messagesArray = []
             msgs.forEach(msg => {
               messagesArray.push(message)
             })
             let sorted = messagesArray.sort((a, b) => { a.timestamp > b.timestamp })
             setPastPublicMessages(...sorted, ...pastPublicMessages)
           })
           collect(base.api.query.read({queryDeleted}), (err, msgs) => {
             msgs.forEach(msg => {
               deletePastPost(msg.messageId)
             })
           })
           collect(base.api.query.read({queryEdited}), (err, msgs) => {
             msgs.forEach(msg => {
               editPastPost(msg)
             })
           })
         })
       }
     })()
  }, [earliestTimestamp])

  if (type === 'publicRoom') {
    return (
      <>
      <Button
        onClick={handleLoadMore}
        className="mb-2"
        variant="dark"
        size="large"
        block>
          Load more messages...
      </Button>
      {pastPublicMessages.map(m => {
        <Message
          name={name}
          type={type}
          from={m.from}
          key={m.messageId}
          message={m.message}
          {(isReply) ? {isReply: true, isReplyTo: m.isReplyTo} :  null }
          timestamp={m.timestamp}
         />
      })}
     {publicRoomMessages.filter(m => m.name === name)
       .map(msg => {
         <Message
           name={name}
           type={type}
           from={msg.from}
           key={msg.messageId}
           message={msg.message}
           {(isReply) ? {isReply={true} isReplyTo={msg.isReplyTo} } : null}
           timestamp={m.timestamp}
         />
       })}
    )
  }  else {
    return (
      <>
      { (type === 'privateRoom')
           ? {privateRoomMessages.filter(m => m.name === name)
               .map(msg => {
                <Message
                  name={name}
                  type={type}
                  from={msg.from}
                  key={msg.messageId}
                  message={msg.message}
                  {(isReply) ? isReply={true} isReplyTo={msg.isReplyTo} : null}
                  timestamp={msg.timestamp}
                />
               })}
           :{(type === 'privateChat')
               ? {privateChatMessages.filter(m => m.name === name)
                   .map(msg => {
                     <Message
                       name={name}
                       type={type}
                       from={msg.from}
                       key={msg.messageId}
                       message={msg.message}
                       {(isReply) ? isReply={true} isReplyTo={msg.isReplyTo} : null }
                       timestamp={msg.timestamp}
                   })}
               : null
            }
       }
       </>
    )
  }
}