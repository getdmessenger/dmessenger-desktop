/**
File: crypto/key_public.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Library used for generating and manipulating DWEB public keys.
*/

import assert from 'assert'
import ecurve from 'ecurve'
import BigInteger from 'bigi'
import hash from './hash.js'
import keyUtils from './keyUtils.js'

const secp256k1 = ecurve.getCurveByName('secp256k1');

var G = secp256k1.G
var n = secp256k1.n

export default function PublicKey(Q, pubkey_prefix = 'DWB') {
  if (typeof Q === 'string') {
    const publicKey = PublicKey.fromString(Q, pubkey_prefix)
    assert(publicKey != null, 'Invalid public key')
    return publicKey
  } else if (Buffer.isBuffer(Q)) {
    return PublicKey.fromBuffer(Q)
  } else if (typeof Q === 'object' && Q.Q) {
    return PublicKey(Q.Q)
  }

  assert.equal(typeof Q, 'object', 'Invalid public key')
  assert.equal(typeof Q.compressed, 'boolean', 'Invalid public key')

  function toBuffer(compressed = Q.compressed) {
    return Q.getEncoded(compressed)
  }

  let pubdata

  function toString(pubkey_prefix = 'DWB') {
    return pubkey_prefix + keyUtils.checkEncode(toBuffer())
  }

  function toUncompressed() {
    var buf = Q.getEncoded(false);
    var point = ecurve.Point.decodeFrom(secp256k1, buf)
    return PublicKey.fromPoint(point);
  }

  function child (offset) {
    assert(Buffer.isBuffer(offset), "Buffer required: offset")
    assert.equal(offset.length, 32, "offset length")
  
    offset = Buffer.concat([ toBuffer(), offset])
    offset = hash.sha256(offset)

    let c = BigInteger.fromBuffer(offset)

    if (c.compareTo(n) >= 0) throw new Error("Child offset went out of bounds, try again.")
 
    let cG = G.multiply(c)

    let Qprime = Q.add(cG)

    if (secp256k1.isInfinity(Qprime)) throw new Error("Child offset derived to an invalid key, try again.")

    return PublicKey.fromPoint(Qprime)
  }

  function toHex() {
    return toBuffer().toString('hex')
  }

  return {
    Q,
    toString,
    toUncompressed,
    toBuffer,
    child,
    toHex
  }
}

PublicKey.isValid = function(pubkey, pubkey_prefix = 'DWB') {
  try {
    PublicKey(pubkey, pubkey_prefix)
    return true
  } catch {
    return false
  }
}

PublicKey.fromBinary = function(bin) {
  return PublicKey.fromBuffer(new Buffer(bin, 'binary'));
}

PublicKey.fromBuffer = function(buffer) {
  return PublicKey(ecurve.Point.decodeFrom(secp256k1, buffer));
}

PublicKey.fromPoint = function(point) {
  return PublicKey(point)
}

PublicKey.fromString = function(public_keym, pubkey_prefix = 'DWB') {
  try {
    return PublicKey.fromStringOrThrow(public_key, pubkey_prefix)
  } catch (e) {
    return null;
  }
}

PublicKey.fromStringOrThrow = function(public_key, pubkey_prefix = 'DWB') {
  assert.equal(typeof public_key, 'string', 'public_key')
  const match = public_key.match(/^PUB_([A-Za-z0-9]+)_([A-Za-z0-9]+)$/)
  if (match === null) {
    var prefix_match = new RegExp("^" + pubkey_prefix);
    if (prefix_match.test(public_key)) {
      public_key = public_key.substring(pubkey_prefix.length)
    }
    return PublicKey.fromBuffer(keyUtils.checkDecode(public_key))
  }
  assert(match.length === 3, 'Expecting public key like: PUB_K1_base58pubkey...')
  const [, keyType, keyString] = match
  assert.equal(keyType, 'K1', 'K1 private key expected')
  return PublicKey.fromBuffer(keyUtils.checkDecode(keyString, keyType))
}

PublicKey.fromHex = function(hex) {
  return PublicKey.fromBuffer(new Buffer(hex, 'hex'))
}

PublicKey.fromStringHex = function(hex) {
  return PublicKey.fromString(new Buffer(hex, 'hex'))
}