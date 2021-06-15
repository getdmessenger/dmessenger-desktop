/**
File: components/SidebarHeader.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the header on the main dMessenger Sidebar.

It has the following breakdown:

 Logo  || Avatar || <username> 
          ||            || <user wallet balance>

The Logo and Avatar take up two rows. The avatar is circular and the logo is the dMessenger logo, transparent. 

*/

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Container, Col, Row } from 'react-bootstrap'
import { FABackArrow } from 'react-icons/fa'
import { logo, myCard } from './../jss/components/SidebarHeader'
import { Logo, MyCard } from './'

export default function SidebarHeader ({}) {
  let location = useLocation()

  const isHome = location => {
    if (location.pathname === "/home") return true
    else return false
  }
  
  return (
    <Container fluid >
        {(!isHome)
           ? <Row className="content-justify-left mb-2" style={{height:'20px', width:'100%'}}>
               <Link to="/home"><FABackArrow /></Link>
             </Row>
           : null
        }
      <Row className="mb-6">
        <Col md={4} lg={4} style={logo}>
          <Logo />
        </Col>
        <Col md={6} lg={6} style={myCard}>
          <MyCard />
        </Col>
      </Row>
    </Container>
  )
}