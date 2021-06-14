/**
File: pages/Onboarding.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: A user is forwarded to the onboarding page after a successful signup, where they are asked to upload an avatar and then enter a display name, url, location and bio. Lastly a user is asked to join a few popular rooms. After completing these steps, the user is forwarded to the /home screen.
*/

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import fs from 'fs'
import path from 'path'
import { Form,
             Image,
             CardDeck,
             Button } from 'react-bootstrap'
import { Logo, RoomCard } from './../components'
import { getIdentityInstance } from './../identity/getIdentityInstance'
import { useIdentity } from './../hooks/useIdentity'
import { onboardingBox, avatarUpload, avatarStyle } from './../jss/avatarStyle'
import { FRIEND_AVATAR_DIR } from './../config'

export default function Onboarding () {
  const [ onboardingStatus, setOnboardingStatus ] = useState('start')
  const [ avatar, setAvatar ] = useState()
  const [ convertedAvatar, setConvertedAvatar ] = useState()
  const [ displayName, setDisplayName ] = useState()
  const [ location, setLocation ] = useState()
  const [ bio, setBio ] = useState()
  const [ url, setUrl ] = useState()
  const [ popularRooms, setPopularRooms ] = useState()
  const [ error, setError ] = useState()

  const { currentIdentity } = useIdentity()
  const avatarFilePath = path.join(FRIEND_AVATAR_PATH, 'me.gif')

  useEffect(() => {
    // hard coded for now
    const popular = [
      "bitcoin",
      "ethereum",
      "dogecoin",
      "dmessenger",
      "peeps",
      "arisen",
      "maga",
      "bitshares"
    ]

    setPopularRooms(popular)
  },[])

  const handleAvatar = event => {
    let avatarFile = event.target.files[0]
    let avatarData = fs.readFileSync(avatarFile)
    setAvatar(avatarData)
    // TODO We need to convert to GIF format here, prior to saving to state and writing to avatar directory
    // setConvertedAvatar(convertedAvatarData)
    fs.writeFile(avatarFilePath, avatar)
    setOnboardingStatus('avatarReady')    
  }

  const handleReupload = () => {
    setAvatar()
    fs.unlink(avatarFilePath)
    setOnboardStatus('start')
  }

  const handleFinalizeAvatar = () => {
    setOnboardingStatus('avatarUploaded')
  }

  const handleDisplayName = () => {
    if (displayName.length < 1) {
      handleError('Display name must be at least one character long.')
    }  else {
      clearError()
      setOnboardingStatus('displayNameCreated')
    }
  }

  const handleUrl = () => {
    let urlRegexp = /(\w+):\/\/([\w.]+)\/(\S*)/
    if (!urlRegexp.test(url)) {
      handleError('A url has to be in the format: http://www.website.com')
    }  else {
      clearError()
      setOnboardingStatus('urlCreated')
    }
  }

  const handleBio = () => {
    let bioWords = bio.split(" ")
    if (bioWords.length < 5) {
      handleError('Your bio must be at least 5 words long')
    }  else {
      clearError()
      setOnboardingStatus('bioCreated')
    }
  }

  const handleLocation = () => {
    if (location.length < 1) {
      handleError('Please enter your location, e.g. Mars')
    }  else {
      clearError()
      setOnboardingStatus('locationCreated')
    }
  }

  const handleError = err => {
    setError(err)
    setTimeout(() => {
      setError()
    }, 10000)
  }

  const clearError = () => setError()

  const handleFinalize = async ()  => {
    await id.addUserData({
      avatar: avatar,
      bio: bio,
      location: location,
      url: url,
      displayName: displayName
    })
    navigate('/home')
  }

  if (onboardingStatus === 'start') {
    return (
        <>
      <input accept="image/*" type="file" onChange={handleAvatar} style={{display: 'none'}}  id="avatar-upload" />
      <div style={avatarUpload}>
        <Logo />
        <h1>Choose an avatar</h1>
        {(error) ? <p className="text-danger">{error}</p> : null }
        <Form>
          <div className="mb-3">
            <Form.File custom>
              <Form.File.Input isValid />
              <Form.File.Label
                data-browse="Choose avatar..."
                htmlFor="avatar-upload"
              />
            </Form.File>
          </div>
        </Form>
      </div>
      </>
    )
  }

  if (onboardStatus === 'avatarReady') {
    return (
      <div style={avatarUpload}>
        <Logo />
        <Image
         src={avatarFilePath}
         roundedCircle
         style={avatarStyle} />
        <div className="mb-2">
          <Button variant="primary" size="lg" onClick={handleReupload}>
            Change Avatar
          </Button>{' '}
          <Button variant="success" size="lg" onClick={handleFinalizeAvatar}>
            Next Step
          </Button>
        </div>
      </div> 
    )
  }
  

  if (onboardingStatus === 'avatarUploaded') {
    return (
      <div style={onboardingBox}>
        <Logo />
        <h1>Choose a display name</h1>
        <p className="text-muted">The display name must be at least 1 character long</p>
        {(error) ? <p>{error}</p> : null}
        <Form>
          <Form.Control size="lg" onChange={event => setDisplayName(event.target.value)} placeholder="Enter a display name..." />
          <Button
            variant="primary"
            onClick={handleDisplayName}
            size="lg"
            block>
              Next Step
          </Button>
        </Form>
       </div>
    )
  }
  
  if (onboardingStatus === 'displayNameCreated') {
    return (
      <div style={onboardingBox}>
        <Logo />
        <h1>Enter your location...</h1>
        <p className="text-muted">Your location must be at least one character long, e.g. Mars.</p>
        {(error) ? <p>{error}</p> : null }
        <Form>
          <Form.Control
             size="lg"
             onChange={ event => setLocation(event.target.value) }
             placeholder="Venus.." />
          <Button
              variant="primary"
              onClick={handleLocation}
              size="lg"
              block>
                Next Step
          </Button>
        </Form>
      </div>
    )
  }

  if (onboardingStatus === 'locationCreated') {
    return (
      <div style={onboardingBox}>
        <Logo />
        <h1>Tell us about yourself...</h1>
        <p className="text-muted">Your bio must be at least 5 words long.</p>
        {(error) ? <p>{error}</p> : null}
        <Form>
          <Form.Control as="textarea" rows={3} onChange={ event => setBio(event.target.value) } />
          <Button
            variant="primary"
            onClick={handleBio}
            size="lg"
            block>
              Next Step
          </Button>
        </Form>
       </div>
    )
  }

  if (onboardingStatus === 'bioCreated') {
    return (
      <div style={onboardingBox}>
        <Logo />
        <h1>Link up your followers...</h1>
        {(error) ? <p>{error}</p> : null}
        <p className="text-muted">Your url must be in the format: https://website.com</p>
        <Form>
          <Form.Control
            size="lg"
            placeholder="Enter a url.."
            onChange={event => setUrl(event.target.value)} />
          <Button
            variant="primary"
            onClick={handleUrl}
            size="lg"
            block>
              Next Step
          </Button>
        </Form>
      </div>
    )
  }

  if (onboardingStatus === 'urlCreated') {
    return (
        
      <div style={onboardingBox}>
        <Logo />
        <h1>Join some popular dMessenger rooms ... </h1>
        <CardDeck>
          {popularRooms.map(room => (
            <RoomCard
              roomName={room} />
          ))}
        </CardDeck>
        <Button
          variant="success"
          onClick={handleFinalize}
          size="lg"
          block>
            Get Started With dMessenger
        </Button>
        </div>
    )
  }
}