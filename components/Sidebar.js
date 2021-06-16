/**
File: components/Sidebar.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: The component renders dMessenger's main sidebar within chat-based pages.
*/

import React from 'react'
import { Container } from 'react-bootstrap'
import { sidebar } from './../jss/components/Sidebar'
import { SidebarHeader, ChatSidebar } from './'

export default function Sidebar ({}) {
  return (
    <Container style={sidebar} fluid>
      <SidebarHeader />
      <ChatSidebar />
    </Container>
  )
}
