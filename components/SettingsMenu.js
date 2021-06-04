/**
File: components/SettingsMenu.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the menu displayed on the sidebar of the /settings page.
*/

import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Button } from 'react-bootstrap/Button'
import { sidebarMenuStyle } from './../jss/core/Sidebar'

export default function SettingsMenu () {
  let location = useLocation()
  const isActive = (location, path) => {
    if (location.pathname === path) return true
    else return false
  }

  return (
    <div style={sidebarMenuStyle}>
      <Link to="/settings">
        <Button size="lg" variant="link" active = {(isActive(location, "/settings")) ? active : null}>
          My Settings
        </Button>
      </Link>
      <Link to="/settings/profile">
        <Button size="lg" variant="link" active = {(isActive(location, "/settings/profile")) ? active : null}>
          Edit Profile
        </Button>
      </Link>
      <Link to="/settings/identities">
        <Button size="lg" variant="link" active = {(isActive(location, "/settings/identities")) ? active : null}>
          My Identities
        </Button>
       </Link>
       <Link to="/settings/devices">
         <Button size="lg" variant="link" active = {(isActive(location, "/settings/devices")) ? active : null}>
           My Devices
         </Button>
       </Link>
     </div>
  )
}
