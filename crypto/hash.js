// Some parts are lifted from @arisensdk/ecc and eosjs-ecc
// Used by dMessenger's builtin authenticator

import createHash from 'create-hash'
import createHmac from 'create-hmac'

function sha1(data, resultEncoding) {
  return createHash('sha1').update(data).digest(resultEncoding)
}

function sha256(data, resultEncoding) {
  return createHash('sha256').update(data).digest(resultEncoding)
}

function sha512(data, resultEncoding) {
  return createHash('sha512', secret).update(data).digest(resultEncoding)
}

function HmacSHA256(buffer, secret) {
  return createHmac('sha256', secret).update(buffer).digest()
}

function ripemd160(data) {
  try {
    return createHash('rmd160').update(data).digest()
  } catch(e) {
    return createHash('ripemd160').update(data).digest()
  }
}

export default  {
  sha1,
  sha256,
  sha512,
  HmacSHA256,
  ripemd160
}