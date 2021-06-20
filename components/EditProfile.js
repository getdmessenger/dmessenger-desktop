/**
File: components/EditProfile.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Main component within the /settings/profile/ page, which allows users to edit their profile data.
*/

import React, { useState, useEffect } from 'react'
import { Container, Row, Form, Button, Alert } from 'react-bootstrap'
import fs from 'fs'
import path from 'path'
import { useIdentity } from './../hooks'
import { getIdentityInstance } from './../identity/getIdentityInstance'
import { FRIEND_AVATAR_DIR } from './../config'

export default function EditProfile ({}) {
  const [ saved, setSaved ] = useState()
  const [ displayName, setDisplayName ] = useState()
  const [ bio, setBio ] = useState()
  const [ location, setLocation ] = useState()
  const [ url, setUrl ] = useState()
  const [ avatar, setAvatar ] = useState()
  const [ avatarUrl, setAvatarUrl ] = useState()
  const [ error, setError ] = useState()

  const { currentIdentity } = useIdentity()
  const identity = getIdentityInstance(currentIdentity)

  useEffect(() => {
    (async () => {
      let userData = await identity.getUserData()
      setDisplayName(userData.displayName)
      setBio(userData.bio)
      setLocation(userData.location)
      setUrl(userData.url)
      setAvatar(userData.avatar)
    })()
  })

  useEffect(() => {
    let filePath = path.join(FRIEND_AVATAR_DIR, currentIdentity + '.gif')
    fs.writeFile(filePath, avatar)
    setAvatarUrl(filePath)
  }, [])

  const handleAvatar = event => {
    let a = event.target.files[0]
    let avatarData = fs.readFileSync(a)
    setAvatar(avatarData)
    let filePath = path.join(FRIEND_AVATAR_DIR, currentIdentity + '.gif')
    fs.writeFile(filePath, avatar)
    setAvatarUrl(filePath)
  }

  const handleDisplayName = event => setDisplayName(event.target.value)
  const handleUrl = event => setUrl(event.target.value)
  const handleBio = event => setBio(event.target.value)
  const handleLocation = event => setLocation(event.target.value)
  
  const handleError = error => {
    setError(err)
    setTimeout(setError(), 10000)
  }

  const handleEditProfile = () => {
    if (displayName.length < 1) return handleError('Display name must be at least one character.')
    let urlRegexp = /(\w+):\/\/([\w.]+)\/(\S*)/
    if (!urlRegexp.test(url)) return handleError('URL must be in the format: https://peepsx.com')
    let bioWords = bio.split(" ")
    if (bioWords.length < 5) return handleError('Bio must contain at least 5 words.')
    if (location.length < 1) return handleError('Location must be at least one character long')
    if (avatar.length < 1) return handleError('You must upload an avatar')
    await identity.addUserData({
      avatar: avatar,
      bio: bio,
      location: location,
      url: url,
      displayName: displayName
    })
    setError()
    setSaved(true)
    setTimeout(setSaved(false), 10000)
  }

  return (
      <>
    <input accept="image/gif" type="file"
      onChange={handleAvatar}
      style={{display: 'none'}}
      id="photo-upload" />
    <Container fluid>
    <Row className="mb-2">
      <h2>Edit Profile</h2>
      <p>Below, you can edit different aspects of your profile, like that super weird avatar you have.</p>

      {(saved) 
          ? <Alert variant="success">Your profile details were edited successfully!</Alert>
          : null
      }

      {(error) ? <Alert variant="danger">{error}</Alert> : null}

      <h4>Display name:</h4>
      <Form.Control className="mb-2" value={displayName} size="lg" onChange={handleDisplayName} />

      <h4>Bio:</h4>
      <Form.Control className="mb-2" as="textarea" rows={3} value={bio} onChange={handleBio} />

      <h4>Location:</h4>
      <Form.Control className="mb-2" size="lg" value={location} onChange={handleLocation} />

      <h4>URL:</h4>
      <Form.Control className="mb-2" size="lg" value={url} onChange={handleUrl} />

      <span>
        {(avatarUrl)
           ? <Image src={{width: '150px', height: 'auto'}} src={avatarUrl} roundedCircle />
           : null
        }
        <Form.File.Label htmlFor="photo-upload">
          <Button variant="primary" size="sm">Change Avatar</Button>
        </Form.File.Label>
      </span>

      <Button variant="primary" size="lg" onClick={handleEditProfile} block>
        Edit Profile
      </Button>

    </Row>
  </Container>
  </>
  )
}