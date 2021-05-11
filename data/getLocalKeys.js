/**
File: data/getLocalKeys.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module is used to extract the public keys, in Hex format, from the Basestore that stores both the Identity Base (identityDB) and the Local Base (localDB). 
*/
import { getIdentityBase } from './getIdentityBase'
import { getLocalBase } from './getLocalBase'

export default async function getLocalKeys (username) {
  const identityDb = await getIdentityBase(username)
  const localDb = await getLocalBase(username)
  
  const identityKey = identityDb.key.toString('hex')
  const localDbKey = localDb.key.toString('hex')

  return {
    identityKey,
    localDbKey
  }
}