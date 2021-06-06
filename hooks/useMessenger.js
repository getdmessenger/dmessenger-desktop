/**
File: hooks/useMessenger.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports the MessengerProvider, MessengerContext and the useMessenger hook. This 
enables other components to utilize and edit state related to public rooms, private rooms and private chats, 
as well as a user's online status, activity time, and currently selected chat within a chat window. 
*/

import React, { createContext, useState, useContext } from 'react'

const MessengerContext = createContext()
export const useMessenger = () => useContext(MessengerContext)

export function MessengerProvider ({ children }) {
  const [ publicRooms, setPublicRooms ] = useState()
  const [ privateRooms, setPrivateRooms ] = useState()
  const [ privateChats, setPrivateChats ] = useState()
  const [ peerCount, setPeerCount ] = useState()
  const [ roomPeerCounts, setRoomPeerCounts ] = useState()
  const [ pastPublicRoomMessages, setPastPublicRoomMessages ] = useState()
  const [ publicRoomMessages, setPublicRoomMessages ] = useState()
  const [ privateRoomMessages, setPrivateRoomMessages ] = useState()
  const [ privateChatMessages, setPrivateChatMessages ] = useState()
  const [ acceptedRooms, setAcceptedRooms ] = useState()
  const [ onlineStatus, setOnlineStatus ] = useState()
  const [ activeTime, setActiveTime ] = useState()
  const [ selectedChat, setSelectedChat ] = useState()
  const [ privateRoomsAreActive, setPrivateRoomsAreActive ] = useState()
  const [ privateChatsAreActive, setPrivateChatsAreActive ] = useState()
  
  const appendPublicRoomMessage = (messages, newMessage) => {
    setPublicRoomMessages(...messages, newMessage)
  }

  const appendPrivateRoomMessage = (messages, newMessage) => {
    setPrivateRoomMessages(...messages, newMessage)
  }

  const appendPrivateChatMessage = (messages, newMessage) => {
    setPrivateChatMessages(...messages, newMessage)
  }

  const pushSelectedChat = chat => setSelectedChat(chat)

  const pushActiveTime = time => setActiveTime(time)

  const pushOnlineStatus = status => setOnlineStatus(status)

  return (
    <MessengerContext.Provider
      value={{ publicRooms,
                   setPublicRooms,
                   privateRooms,
                   setPrivateRooms,
                   privateChats,
                   setPrivateChats,
                   peerCount,
                   setPeerCount,
                   roomPeerCounts,
                   setRoomPeerCounts,
                   pastPublicRoomMessages,
                   setPastPublicRoomMessages,
                   publicRoomMessages,
                   privateRoomMessages,
                   privateChatMessages,
                   appendPublicRoomMessage,
                   appendPrivateRoomMessage,
                   appendPrivateChatMessage,
                   acceptedRooms,
                   setAcceptedRooms,
                   onlineStatus,
                   setOnlineStatus,
                   activeTime,
                   pushActiveTime,
                   selectedChat,
                   pushSelectedChat,
                   privateRoomsAreActive,
                   setPrivateRoomsAreActive,
                   privateChatsAreActive,
                   setPrivateChatsAreActive}}>
      {children}
    </MessengerContext.Provider>
  )
}