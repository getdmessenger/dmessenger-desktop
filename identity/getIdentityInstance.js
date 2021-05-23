/**
File: identity/getIdentityInstance.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that returns a DWebIdentity instance, for different use-cases, depending on the opts passed into the module. 
*/

import { DWebIdentity } from '@dwebid/core'
import { dhtOpts } from './../opts/dhtOpts'

export default async function getIdentityInstance (user, opts) {
  const idOpts = { dhtOpts, user }
  return new Promise((resolve, reject) => {
    if (!user) return reject(new Error('opts must include a username'))
    const id = new DWebIdentity({
      ...idOpts,
      ...opts
    })
    return resolve(id)
  })
}