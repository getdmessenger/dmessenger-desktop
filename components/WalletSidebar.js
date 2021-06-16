/**
File: components/WalletSidebar.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component renders the sidebar on dMessenger's /wallet/ page.
*/

import React from 'react'
import { Container } from 'react-bootstrap'
import { SidebarHeader, WalletMenu } from './'
import { sidebar } from './../jss/components/Sidebar'

export default function WalletSidebar ({}) {
  return (
    <Container style={sidebar} fluid>
      <SidebarHeader />
      <WalletMenu />
    </Container>
  )
}
