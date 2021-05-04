import sodium from '@ddatabase/crypto/sodium'

export default function getNonceBytes () {
  const value = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)
  const nonce = value.slice(0, sodium.crypto_secretbox_NONCEBYTES)
  
  return nonce
}