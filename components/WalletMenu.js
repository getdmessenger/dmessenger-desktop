/**
File: components/WalletMenu.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the menu displayed on the sidebar of the /wallet page.
*/

import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Button } from 'react-bootstrap/Button'
import { sidebarMenuStyle } from './../jss/core/Sidebar'

export default function WalletMenu () {
  let location = useLocation()
  const isActive = (location, path) => {
    if (location.pathname === path) return true
    else return false
  }

  return (
    <div style={sidebarMenuStyle}>
      <Link to="/wallet">
        <Button size="lg" variant="link" active = {(isActive(location, "/wallet")) ? active : null }>
          Wallet Overview
        </Button>
      </Link>
      <Link to="/wallet/accounts">
        <Button size="lg" variant="link" active = {(isActive(location, "/wallet/accounts")) ? active : null }>
           My Accounts
         </Button>
       </Link>
       <Link to="/wallet/upvotes">
         <Button size="lg" variant="link" active = {(isActive(location, "/wallet/upvotes")) ? active : null }>
            My Upvotes
          </Button>
       </Link>
       <Link to="/wallet/send">
         <Button size="lg" variant="link" active = {(isActive(location, "/wallet/send")) ? active : null }>
             Send Money
           </Button>
        </Link>
      </div>
  )
}