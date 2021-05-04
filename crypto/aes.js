/**
File: crypto/aes.js
Description: This file is used for AES-based encryption/decryption within dMessenger-based private conversations and is Browserify-ready, so that this can work within a web browser. When two peers have a private conversation, each exchange a secret key that is used to encrypt messages between each other. This library is used for encrypting messages and decrypting messages, that are stored in an individual dTree and exchanged between peers. Since each peer possesses the public and private key related to a given private conversation, these parameters can easily be provided to both the 'encrypt' and 'decrypt' functions that are exported from this module. Even if an outsider were to get ahold of the data from a private conversation via its related dTree, they would be unable to decipher the data, without the public/private keypair that the participants possess.
Author: Jared Rice Sr. <jared@peepsx.com>
Notes: We could expand upon this, but I think it works for what we're using it for at this time. Really, we're only using AES to encrypt/decrypt messages stored in a Multi dTree shared between two users. The browserify-aes module has a ton of functionality that we can extrapolate, if needed and it can all be added and exported from this module within dMessenger if we need it in the future. 
*/

import ByteBuffer from 'bytebuffer'
import crypto from 'browserify-aes'
import assert from 'assert'
import { PublicKey } from './key_public'
import { PrivateKey } from './key_private'
import hash from './hash.js'

const Long = ByteBuffer.Long

export default = {
  encrypt,
  decrypt
}

function encrypt(private_key, public_key, message, nonce = uniqueNonce()) {
  return crypt(private_key, public_key, nonce, message)
}

function decrypt(private_key, public_key, nonce, message, checksum) {
  return crypt(private_key, public_key, nonce, message, checksum).message
}

function crypt(private_key, public_key, nonce, message, checksum) {
  private_key = PrivateKey(private_key)
  if (!private_key)
    throw new Error('private key is required')

  public_key = PublicKey(public_key)
  if (!public_key)
    throw new Error('public key is required')

  nonce = toLongObj(nonce)
  if (!nonce)
    throw new Error('nonce is required')

  if (!Buffer.isBuffer(message)) {
    if (typeof message !== 'string')
      throw new Error('message should be a buffer or a string')
    message = new Buffer(message, 'binary')
  }

  if (checksum && typeof checksum !== 'number')
    throw new Error('checksum should be a number')

  const S = private_key.getSharedSecret(public_key)
  let ebuf = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
  ebuf.writeUint64(nonce)
  ebuf.append(S.toString('binary'), 'binary')
  ebuf = new Buffer(ebuf.copy(0, ebuf.offset).toBinary(), 'binary')
  const encryption_key = hash.sha512(ebuf)

  const iv = encryption_key.slice(32, 48)
  const key = encryption_key.slice(0, 32)

  let check = hash.sha256(encryption_key)
  check = check.slice(0, 4)
  const cbuf = ByteBuffer.fromBinary(check.toString('binary'), ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
  check = cbuf.readUint32()

  if (checksum) {
    if(check !== checksum)
      throw new Error('Invalid key')
    message = cryptoJsDecrypt(message, key, iv)
  } else {
    message = cryptoJsEncrypt(message, key, iv)
  }
  return { nonce, message, checksum: check } 
}

function cryptoJsDecrypt(message, key, iv) {
  assert(message, "Missing cipher text")
  message = toBinaryBuffer(message)
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  message = Buffer.concat([decipher.update(message), decipher.final()])
  return message
}

function cryptoJsEncrypt(message, key, iv) {
  assert(message, "Missing plain text")
  message = toBinaryBuffer(message)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  message = Buffer.concat([cipher.update(message), cipher.final()])
  return message
}

function uniqueNonce() {
  if (unique_nonce_entropy === null) {
    const b = new Uint8Array(randomBytes(2))
    unique_nonce_entropy = parseInt(b[0] << 8 | b[1], 10)
  }

  let long = Long.fromNumber(Date.now())
  const entropy = ++unique_nonce_entropy % 0xFFFF
  long = long.shiftLeft(16).or(Long.fromNumber(entropy));
  return long.toString()

}

// Now this is crazy :) - A ternary operation, within another ternary operation. Ok.. it's not so crazy lol
const toLongOb = o => (o ? Long.isLong(o) ? o : Long.fromString(o) : o)

// And another one...
const toBinaryBuffer = o => (o ? Buffer.isBuffer(o) ? o : new Buffer(o, 'binary') : o)