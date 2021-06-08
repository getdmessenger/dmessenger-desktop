/**
File: components/ChatSidebar.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the chat sidebar, displayed on the PublicRoom.js, PrivateRoom.js, PrivateChat.js and Home.js pages (/pages/). This displays all of the rooms/chats a user is members of, in the order of the rooms/chats that have the most recently received messages. Each item on the sidebar is an instance of ChatSidebarItem (components/ChatSidebarItem.js), where each item is a room/chat the user is a member of.
*/

import React, { useEffect } from 'react'
import { chatSidebarItem } from './chatSidebarItem'
import { chatSidebar } from './../jss/components/ChatSidebar'
import { useMessenger } from './../hooks/useMessenger'

export default function ChatSidebar () {
  const [ chats, setChats ] = useState()
  const [ messages, setMessages ] = useState()
  const [ latestList, setLatestList ] = useState()

  const {
    publicRooms,
    privateRooms,
    privateChats,
    publicRoomMessages,
    privateRoomMessages,
    privateChatMessages
  } = useMessenger()

  useEffect(() => {
   /** COMMENT:
      We combine all rooms/chats into a single chat state and public/private room/private chat messages
      into a single message state, so that we can iterate these lists to build out the sidebar part
      of the UI.
   */
   setChats(...publicRooms, ...privateRooms, ...privateChats)
   setMessages(...publicRoomMessages, ...privateRoomMessages, ...privateChatMessages) 
  })

  useEffect(() => {
    /** COMMENT:
        For each chat, we filter the list to find the most recently sent message and push this entry
        into the latestChats array. We then set the state for "latestList" using the latestChats data.
        This is reloaded everytime the state for "messages" changes (when new messages are received).        
    */

    let latestChats = []
    for (const chat of chats) {
      let f = messages.filter(x => x.name === chat.name || x.name === chat.roomName)
      f.sort((a,b) => a.timestamp > b.timestamp)
      latestChats.push(f[0])
    }
    setLatestList(...latestChats)

    // sort the list by timestamp
    latestList.sort((a,b) => a.timestamp > b.timestamp)    
  }, [messages])

  return (
    <div style={chatSidebar}>
        {latestList.map((chat,i)=>{
            return(
                <ChatSidebarItem
                type={chat.type}
                name={chat.name}
                from={chat.from}
                message={chat.message}
                timestamp={chat.timestamp}
              />
            )
        })}
    </div>
  )
}