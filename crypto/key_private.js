import ecurve from 'ecurve'
import BigInteger from 'bigi'
import assert from 'assert'
import hash from './hash'
import PublicKey from './key_public'
import keyUtils from './key_utils'
import createHash from 'create-hash'
import promiseAsync from './promise-async'

const Point = ecurve.Point
const secp256k1 = ecurve.getCurveByName('secp256k1')

const G = secp256k1.G
const n = secp256k1.n

export default function PrivateKey(d) {
  if (typeof d === 'string') {
    return PrivateKey.fromString(d)
  } else if (Buffer.isBuffer(d)) {
    return PrivateKey.fromBuffer(d)
  } else if (typeof d === 'object' && BigInteger.isBigInteger(d.d)) {
    return PrivateKey(d.d)
  }

  if (!BigInteger.isBigInteger(d)) {
    throw new TypeError('Invalid private key')
  }

  function toString() {
    return toWif()
  }

  function toWif() {
    var private_key = toBuffer()
    private_key = Buffer.concat([new Buffer([0x80]), private_key])
    return keyUtils.checkEncode(private_key, 'sha256x2')
  }

  let public_key

  function toPublic() {
    if (public_key) {
      return public_key
    }
    const Q = secp256k1.G.multiply(d)
    return public_key = PublicKey.fromPoint(Q)
  }

  function toBuffer() {
    return d.toBuffer(32)
  }

  function getSharedSecret(public_key) {
    public_key = PublicKey(public_key)
    let KB = public_key.toUncompressed().toBuffer()
    let KBP = Point.fromAffine(
      secp256k1,
      BigInteger.fromBuffer(KB.slice( 1, 33 )),
      BigInteger.fromBuffer(KB.slice( 33, 65 ))  
    )
    let r = toBuffer()
    let P = KBP.multiply(BigInteger.fromBuffer(r))
    let S = P.affineX.toBuffer({size:32})
    return hash.sha512(S)
  }

  function getChildKey(name) {
    const index = createHash('sha256').update(toBuffer()).update(name).digest()
    return PrivateKey(index)
  }

  function toHex() {
    return toBuffer().toString('hex')
  }

  return {
    d,
    toWif,
    toString,
    toPublic,
    toBuffer,
    getSharedSecret,
    getChildKey
  }
}

function parseKey(privateStr) {
  assert.equal(typeof privateStr, 'string', 'privateStr')
  const match = privateStr.match(/^PVT_([A-Za-z0-9]+)_([A-Za-z0-9]+)$/)

  if (match === null) {
    const versionKey = keyUtils.checkDecode(privateStr, 'sha256x2')
    const version = versionKey.readUInt8(0);
    assert.equal(0x80, version, `Expected version ${0x80}, instead got ${version}`)
    const privateKey = PrivateKey.fromBuffer(versionKey.slice(1))
    const keyType = 'K1'
    const format = 'WIF'
    return { privateKey, format, keyType }
  }

  assert(match.length === 3, 'Expecting private key like: PVT_K1_base58privateKey.')
  const [, keyType, keyString] = match
  assert.equal(keyType, 'K1', 'K1 private key expected.')
  const privateKey = PrivateKey.fromBuffer(keyUtils.checkDecode(keyString, keyType))
  return { privateKey, format: 'PVT', keyType }
}

PrivateKey.fromHex = function(hex) {
  return PrivateKey.fromBuffer(new Buffer(hex, 'hex'))
}

PrivateKey.fromBuffer = function(buf) {
  if (!Buffer.isBuffer(buf)) {
    throw new Error("Expecting paramter to be a Buffer type")
  }

  if (buf.length === 33 && buf[32] === 1) {
    buf = buf.slice(0, -1)
  }

  if (32 !== buf.length) {
    throw new Error(`Expecting 32 bytes, instead got ${buf.length}`)
  }

  return PrivateKey(BigInteger.fromBuffer(buf))
}

PrivateKey.fromSeed = function(seed) {
  if (!(typeof seed === 'string')) {
    throw new Error('seed must be of type string')
  }

  return PrivateKey.fromBuffer(hash.sha256(seed))
}

PrivateKey.isWif = function(text) {
  try {
    assert(parseKey(text).format === 'WIF')
    return true
   } catch (e) {
     return false
   }
}

PrivateKey.isValid = function(key) {
  try {
    PrivateKey(key)
    return true
  } catch (e) {
    return false
  }
}

PrivateKey.fromWif = function(str) {
  return PrivateKey.fromString(str)
}

PrivateKey.fromString = function(privateStr) {
  return parseKey(privateStr).privateKey
}

PrivateKey.randomKey = function(cpuEntropyBits = 0) {
  return PrivateKey.initiate().then(() => (
    PrivateKey.fromBuffer(keyUtils.random32ByteBuffer({cpuEntropyBits}))
  ))
}

PrivateKey.unsafeRandomKey = function() {
  return Promise.resolve(
    PrivateKey.fromBuffer(keyUtils.random32ByteBuffer({safe: false}))
  )
}

let initialized = false, unitTested = false

function initiate() {
  if (initialized) {
    return
  }
  unitTest()
  keyUtils.addEntropy(...keyUtils.cpuEntropy())
  assert(keyUtils.entropyCount() >= 128, 'insufficient entropy')
  initialized = true
}

PrivateKey.initialized = promiseAsync(initialize)

function unitTest() {

  // WRITE Unit Tests. I cannot write unit tests as I have no way of generating keys haha. Whoops - just found 
  // the downside of not having a computer :)

  unitTested = true
}