/**
File: swarm/restartSwarms.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This exports a module that will run the startSwarm() function for a set of configurations pulled from the localDb. When dMessenger's application initializes (when it first opens), this function is ran for all network configs stored in the localDb. This means all the data that was created while the user was offline, will be replicated to the user's local machine and other devices that are syncing the same.
*/

import { startSwarm } from './startSwarm'

export default async function restartSwarms (db, configs) {
  for (const config of configs) {
    startSwarm(db, config.discoveryKey)
  }
}