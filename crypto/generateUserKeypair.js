/**
File: crypto/generateUserKeypair.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module is used for creating a public/private keypair that is stored alongside a username on dWeb's DHT. It's used within the identity 'opts', within @dwebid/core (the DWebIdentity class)
*/

import ddatabaseCrypto from '@ddatabase/crypto'

export default function generateUserKeypair () {
  const randomBytes = ddatabaseCrypto.randomBytes(32)
  const { publicKey, privateKey } = ddatabaseCrypto.keypair(randomBytes)

  return {
    publicKey,
    privateKey
  }
}