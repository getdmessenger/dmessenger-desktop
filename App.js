import { hot } from 'react-hot-loader'
import React, { useEffect } from 'react'
import { MainRouter } from './MainRouter'
import { BrowserRouter } from 'react-router-dom'
import { IdentityProvider } from './../hooks/useIdentity'
import { Controller } from './Controller';

// TODO: need to add Bootstrap style hooks here and in render.

const App = () => {
  return (
    <BrowserRouter>
      <IdentityProvider>
        <Controller>
          <MainRouter />
        </Controller>
      </IdentityProvider>
    </BrowserRouter>
  )
}

export default hot(module) (App)