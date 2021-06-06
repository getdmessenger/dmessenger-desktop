import { hot } from 'react-hot-loader'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { MainRouter } from './MainRouter'
import { IdentityProvider } from './hooks/useIdentity'
import { MessengerProvider } from './hooks/useMessenger'

const App = () => {
  return (
    <BrowserRouter>
      <IdentityProvider>
        <MessengerProvider>
          <MainRouter />
        </MessengerProvider>
      </IdentityProvider>
    </BrowserRouter>
  )
}

export default hot(module) (App)