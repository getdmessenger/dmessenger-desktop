/**
File: authentication/confirmPin.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a function that is used for confirming a pin number. It takes a user/pin parameter combo, and attempts to decrypt the user's stored seed, which is encrypted within the app's private database using a given pin number. 

Since the seed is used to encrypt secret keys, held within the wallet. Are method for confirming the pin is easy:
1. Use the pin to decrypt the user's stored seed (found at '${user}/seed' within the privatedb)
2. Use the decrypted seed to decrypt the secret key for the user's default record within the identity document 
(found at '!identities!default!SECRET' within the identity document)
3. Sign a message using the decrypted secret key (in this case, the message "test")
4. Verify that the message derived from the secret key, that matches the public key found within the same default record (found at '!identities!default' within the identity document [publicKey]).

If verified, then the pin that decrypted the seed, was able to successfully decrypt the secret key for the default identity record, and was verified via signature verification using the public key that is also stored within the same identity record. No further validation is needed, although, we could probably make this function a bit cleaner.

If pin is verified using verify(), this function returns true, if falsy, it returns false.
*/

import { sign, verify } from '@ddatabase/crypto'
import { Identity } from './../services'
import { getIdentityInstance } from './../identity'

export default async function confirmPin (user, pin) {
  return new Promise((resolve) => {
    const id = await getIdentityInstance(user)
    const idService = new Identity(user)
    let decryptedSecretKey = await idService.decryptSecretKey('default', pin)
    let signature = sign('test', decryptedSecretKey)
    let defaultRecord
    id.getDefaultRecord()
      .then(d => defaultRecord = d)
    let publicKey = defaultRecord.publicKey
    let v = verify('test', signature, publicKey)
    return resolve(v)
  })
}