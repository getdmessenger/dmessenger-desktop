/**
File: components/SettingsSidebar.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component renders the sidebar on dMessenger's /settings/ page.
*/

import React from 'react'
import { Container } from 'react-bootstrap'
import { sidebar } from './../jss/components/Sidebar'
import { SidebarHeader, SettingsMenu } from './'

export default function SettingsSidebar ({}) {
  return (
    <Container style={sidebar} fluid>
      <SidebarHeader />
      <SettingsMenu />
    </Container>
  )
}