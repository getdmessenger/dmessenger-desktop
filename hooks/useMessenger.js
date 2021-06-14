/**
File: hooks/useMessenger.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Hook used for accessing global state related to messaging functionality within the platform.
*/

import React, { createContext,
  useReducer,
  useState,
  useContext } from 'react'

const MessengerContext = createContext()
export const useMessenger = () => useContext(MessengerContext)

export function MessengerProvider ({ children }) {
const [ publicRooms, setPublicRooms ] = useState()
const [ privateRooms, setPrivateRooms ] = useState()
const [ privateChats, setPrivateChats ] = useState()
const [ peerCount, setPeerCount ] = useState()
const [ roomPeerCounts, setRoomPeerCounts ] = useState()
const [ publicRoomMessages, setPublicRoomMessages ] = useState()
const [ privateRoomMessages, setPrivateRoomMessages ] = useState()
const [ privateChatMessages, setPrivateChatMessages ] = useState()
const [ acceptedRooms, setAcceptedRooms ] = useState()
const [ onlineStatus, setOnlineStatus ] = useState()
const [ activeTime, setActiveTime ] = useState()
const [ selectedChat, setSelectedChat ] = useState()
const [ selectedType, setSelectedType ] = useState()
const [ showModal, setShowModal ] = useState()
const [ imageInModal, setImageInModal ] = useState()
const [ replyingTo, setReplyingTo ] = useState()
const [ editing, setEditing ] = useState()

const pushSelectedChat = chat => setSelectedChat(chat)
const pushActiveTime = time => setActiveTime(time)
const pushOnlineStatus = status = setOnlineStatus(status)

const deletePublicRoomMessage = messageId => {
const newMessages = publicRoomMessages.filter(msg => {
msg.messageId !== messageId
})

setPublicRoomMessages(newMessages)
}

const deletePrivateRoomMessage = messageId => {
const newMessages = privateRoomMessages.filter(msg => {
msg.messageId !== messageId
})

setPrivateRoomMessages(newMessages)
}

const deletePrivateChatMessage = messageId =>  {
const newMessages = privateChatMessages.filter(msg => {
msg.messageId !== messageId
})

setPrivateChatMessages(newMessages)
}

const editPublicRoomMessage = newMessage => {
const without = publicRoomMessages.filter(x => x.messageId !== newMessage.messageId)
without.push(newMessage)
setPublicRoomMessages(without)
sortMessages('publicRoom')
}

const editPrivateRoomMessage = newMessage => {
const without = privateRoomMessages.filter(x => x.messageId !== newMessage.messageId)
without.push(newMessage)
setPublicRoomMessages(without)
sortMessages('privateRoom')
}

const editPrivateChatMessages = newMessage => {
const without = privateChatMessages.filter(x => x.messageId !== newMessage.messageId)
without.push(newMessage)
setPrivateChatMessages(without)
sortMessages('privateChat')
}

const sortMessages = type => {
if (type === 'publicRoom') {
const pubMsgs = publicRoomMessages.sort((a,b) => a.timestamp > b.timestamp)
setPublicRoomMessages(pubMsgs)
}
if (type === 'privateRoom') {
const privMsgs = privateRoomMessages.sort((a,b) => a.timestamp > b.timestamp)
setPrivateRoomMessages(privMsgs)
}
if (type === 'privateChat') {
const privChatMsgs = privateChatMessages.sort((a,b) => a.timestamp > b.timestamp)
setPrivateChatMessages(privChatMsgs)
}
}

return (
<MessengerContext.Provider
value={{
publicRooms,
setPublicRooms,
privateRooms,
setPrivateRooms,
privateChats,
setPrivateChats,
peerCount,
setPeerCount,
roomPeerCounts,
setRoomPeerCounts,
publicRoomMessages,
privateRoomMessages,
privateChatMessages,
setPublicRoomMessages,
setPrivateRoomMessages,
setPrivateChatMessages,
acceptedRooms,
setAcceptedRooms,
onlineStatus,
pushOnlineStatus,
selectedChat,
setSelectedChat,
pushSelectedChat,
selectedType,
setSelectedType,
showModal,
setShowModal,
imageInModal,
setImageInModal,
replyingTo,
setReplyingTo,
activeTime,
pushActiveTime,
editing,
setEditing,
deletePrivateRoomMessage,
deletePrivateChatMessage,
deletePublicRoomMessage,
editPrivateRoomMessage,
editPublicRoomMessage,
editPrivateChatMessage,
sortMessages
}}
>
{children}
</MessengerContext.Provider>
)
}
