/**
File: components/ChatHeader.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the header above the Chat Window. It conforms to show data related to a public room, private room or a particular user within a private chat.
*/

import React, { useState, useEffect } from 'react'
import { CreateNewRoom,
             CreateNewChat,
             ViewRoom,
             EditRoomDetails,
             ViewModerators,
             AddModerator,
             InviteUser,
             LeaveRoom,
             ViewRoomPolicy } from './../popups'
import { Container, Col, Row, DropdownButton } from 'react-bootstrap'
import { useMessenger, useIdentity, useFetchUser, useFetchRoom } from './../hooks'
import { FaAlignJustify, FaPlus } from 'react-icons/fa'
import { isModerator } from './../helpers/manifestHelp'
import { chatHeaderContainer } from './../jss/components/ChatHeader'
import { RoomAvatar, FriendAvatar, FollowButton } from './'

export default function ChatHeader ({ name, type }) {
  const [ showCreateChat, setShowCreateChat ] = useState(false)
  const [ showCreateRoom, setShowCreateRoom ] = useState(false)
  const [ showViewRoom, setShowViewRoom ] = useState(false)
  const [ showViewModerator, setShowViewModerator ] = useState(false)
  const [ showEditRoom, setShowEditRoom ] = useState(false)
  const [ showAddModerator, setShowAddModerator ] = useState(false)
  const [ showInviteUser, setShowInviteUser ] = useState(false)
  const [ showLeaveRoom, setShowLeaveRoom ] = useState(false)
  const [ showViewRoomPolicy, setShowViewRoomPolicy ] = useState(false)

  const { currentIdentity } = useIdentity()
  const { roomPeerCounts } = useMessenger()

  const { data: roomData, 
             error: roomError, 
             avatar: roomAvatar, 
             avatarUrl: roomAvatarUrl, 
             roomDescription, 
             roomPolicy } = useFetchRoom(name, type)

  const { data: userData, 
             error: userError, 
             loading: userLoading, 
             avatar: userAvatar, 
             avatarUrl: userAvatarUrl, 
             bio, 
             displayName } = useFetchUser(name)

  return (
      <>
    <CreateNewRoom
      id={currentIdentity}
      show={showCreateRoom} 
      onClose={() => setShowCreateRoom(false)} 
    />

    <CreateNewChat 
      id={currentIdentity} 
      name={name} 
      type={type} 
      show={showViewRoom} 
      onClose={() => setShowCreateChat(false)} 
     />

    <ViewRoom
      id={currentIdentity}
      name={name}
      type={type}
      show={showViewRoom}
      onClose={() => setShowViewRoom(false)} 
    />
    
    <EditRoomDetails
      id={currentIdentity}
      name={name}
      type={type}
      show={showEditRoom}
      onClose={() => setShowEditRoom(false)}
    />

    <ViewModerators
      id={currentIdentity}
      name={name}
      type={type}
      show={showViewRoom}
      onClose={() => setShowViewModerators(false)}
    />

    <AddModerator
      name={name}
      type={type}
      moderator={currentIdentity}
      show={showAddModerator}
      onClose={() => setShowAddModerator(false)}
    />

    <InviteUser
      id={currentIdentity}
      name={name}
      show={showInviteUser}
      onClose={() => setShowInviteUser(false)}
    />

    <LeaveRoom
      id={currentIdentity}
      name={name}
      type={type}
      show={showLeaveRoom}
      onClose={() => setShowLeaveRoom(false)}
    />

    <ViewRoomPolicy
      id={currentIdentity}
      name={name}
      type={type}
      show={showViewRoomPolicy}
      onClose={() => setShowViewRoomPolicy(false)}
    />

    <Container style={chatHeaderContainer} fluid>
      <Row>
        <Col md={2} lg={2}>
          {(type !== 'privateChat')
            ? <RoomAvatar room={name} size="lg" />
            : <FriendAvatar user={name} size="lg" />
          }
        </Col>
        <Col md={6} lg={6}>
          <Row style={{height: '80%', width: '100%'}}>
            <h3>@{name}</h3>
          </Row>
          <Row style={{height: '20%', width: '100%'}}>
            {(type !== 'privateChat')
               ? <p className="m2">{roomDescription}</p>
               : <p className="m2">{bio}</p>
            }
          </Row>
        </Col>
        <Col md={2} lg={2}>
          <Row className="justify-content-right" style={{height: '33.33%', width: '100%'}}>
            {(type !== 'privateChat')
                ? <p className="m2">{roomPeerCounts[name]} Peers </p>
                : null
            }
            <DropdownButton
              variant="primary"
              title={<FaAlignJustify />}
            >
              {(type !== 'privateChat')
                 ? <Dropdown.Item onClick={() => setShowViewRoom(true)}>View Room Info</Dropdown.Item>
                 : <Dropdown.Item href={`/friends/${name}`}>View User Profile</Dropdown.Item>
              }
              {(type !== 'privateChat')
                ? 
                <div>
                <Dropdown.Item onClick={() => setShowViewModerators(true)}>View Moderators</Dropdown.Item>
                   {(isModerator(currentIdentity, type, name))
                      ? <div>
                      <Dropdown.Item onClick={() => setShowAddModerator(true)}>Add Moderator</Dropdown.Item>
                        <Dropdown.Item onClick={() => setShowEditRoom(true)}>Edit Room Details</Dropdown.Item>
                        </div>
                      : null
                   }
                   {(type === 'privateRoom')
                      ? <Dropdown.Item onClick={() => setShowInviteUser(true)}>Invite User To Room</Dropdown.Item>
                      : null
                   }
                   <Dropdown.Item onClick={() => setShowLeaveRoom(true)}>Leave Room</Dropdown.Item>
                   </div>

                : null
              }
            </DropdownButton>
            <DropdownButton
              variant="success"
              title={<FaPlus />}
            >
              <Dropdown.Item onClick={() => setShowCreateRoom(true)}>Create New Room</Dropdown.Item>
              <Dropdown.Item onClick={() => setShowCreateChat(true)}>Create New Chat</Dropdown.Item>
           </DropdownButton>
          </Row>
          <Row className="justify-content-right" style={{height: '66.66%', width: '100%'}}>
            {(type === 'privateChat')
              ? <FollowButton user={name} />
              : <Button variant="success" onClick={() => setShowViewRoomPolicy(true)}>View Room Policy</Button>
            }
          </Row>
        </Col>
      </Row>
    </Container>
    </>
  )
}