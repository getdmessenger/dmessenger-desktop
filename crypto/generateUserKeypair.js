/**
File: crypto/generateUserKeypair.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Exports a module that is used for generating user keypairs, for use when creating user records on a USwarm DHT.
*/

import idsign from '@dwebid/sign'

export default function generateUserKeypair () {
  const { keypair } = idsign()
  const { publicKey, secretKey } = keypair()
  return {
    publicKey,
    secretKey
  }
}