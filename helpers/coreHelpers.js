/**
File: helpers/coreHelpers.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports functions that are used throughout the core of the application.
*/

import { getIdentityInstance } from './../identity/getIdentityInstance'

export async function publishStatus (currentId, status) {
  const id = await getIdentityInstance(currentId)
  
  id.addAppData({
    appName: "dmessenger",
    dataType: "core",
    data: {
      updateTime: new Date(),
      status: status
    },
    keyName: "status" 
  })
}

export async function getStatus (currentId) {
  const id = await getIdentityInstance(currentId)
  const db = await id.getDb()
  db.get('/dmessenger/core/status', (err, nodes) => {
    if (err) return false
    let len = nodes.length
    if (nodes && nodes[len].value !== null) return nodes[len].value
  })
}