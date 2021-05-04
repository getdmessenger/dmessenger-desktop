import ecc from '@arisensdk/ecc'

export default function generateUserKeypair () {
  ecc.randomKey().then(privateKey => {
    return [
      privateKey,
      ecc.privateToPublic(privateKey)
    ]
  })
}

// Example Usage
// import { generateUserKeypair } from './util/generateUserKeypair.js'
//
// let { PrivateKey, PublicKey } = generateUserKeypair()

// This is used by dSocial and dMessenger's identity management system, to create a keypair
// for a user's DID document. This function is used within the identity creation process, for creating
// the actual user's keypair. Users of dMessenger, when creating encrypted conversations, use a user's
// public key, that is stored in the user's DID for message authentication.