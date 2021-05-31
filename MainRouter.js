import React from 'react'
import { Router, Switch } from 'react-router-dom'
import {
  Auth,
  Login,
  LoginUser,
  SyncInit,
  SyncRemote,
  SyncInitComplete,
  SyncRemoteComplete,
  Signup,
  Home
} from './pages'

 const MainRouter = () => {
  return (
    <div>
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
        <Route path="*" component={Whoops404} />
      </Switch>
    </div>
  )
}

export default MainRouter;