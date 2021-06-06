import React from 'react'
import { Router, Switch } from 'react-router-dom'
import {  Start,
              Auth,
              Login,
              LoginUser,
              SyncInit,
              SyncRemote,
              SyncInitComplete,
              SyncRemoteComplete,
              Signup,
              Home,
              PublicRoom,
              PrivateRoom,
              PrivateChat,
              Wallet,
              Settings,
              Devices,
              Identities,
              Profile,
              Logout,
              Accounts,
              Upvotes,
              Send,
              Friends,
              Friend,
              Whoops404 } from './pages'
import { Controller } from './components'
import { appBox } from './jss/Core'

const MainRouter = () => {
  return (
    <div style={appBox}>

      // Only render the Controller if the user is logged-in. This hides the Controller on auth pages.
      { (currentIdentity) ? <Controller /> : null }

      <Switch>
        <Route exact path="/" component={Start} />
        <Route exact path="/auth/:user" component={Auth} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/login/:user" component={LoginUser} />
        <Route exact path="/sync/:user" component={SyncInit} />
        <Route exact path="/sync/new-request" component={SyncRemote} />
        <Route exact path="/sync/complete" component={SyncInitComplete} />
        <Route exact path="/sync/finished" component={SyncRemoteComplete} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/home" component={Home} />
        <Route exact path="/publicRoom/:roomName" component={PublicRoom} />
        <Route exact path="/privateRoom/:roomName" component={PrivateRoom} />
        <Route exact path="/privateChat/:username" component={PrivateChat} />
        <Route exact path="/wallet" component={Wallet} />
        <Route exact path="/wallet/accounts" component={Accounts} />
        <Route exact path="/wallet/upvotes" component={Upvotes} />
        <Route exact path="/wallet/send" component={Send} />
        <Route exact path="/settings" component={Settings} />
        <Route exact path="/settings/devices" component={Devices} />
        <Route exact path="/settings/identities" component={Identities} />
        <Route exact path="/settings/profile" component={Profile} />
        <Route exact path="/friends" component={Friends} />
        <Route exact path="/friends/:username" component={Friend} />
        <Route exact path="/logout" component={Logout} />
        <Route path="*" component={Whoops404} />
      </Switch>
    </div>    
  )
}

export default MainRouter;