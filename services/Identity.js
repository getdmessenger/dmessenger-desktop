import { NanoresourcePromise, Nanoresource } from 'nanoresource-promise/emitter'
import dwebsign from 'dwebsign'
import AES from 'aes-oop'
import bip39 from 'bip39'
import scrypt from 'scrypt-async'
import { PrivateDb } from './../services/PrivateDb'
import { getIdentityInstance } from './../identity/getIdentityInstance'

export default class Identity extends Nanoresource {
  constructor (username) {
    this.username = username,
    this.db = new PrivateDb()
    this.id = getIdentityInstance(username)
  }
  
  async _open () {
    return new Promise((async resolve => {
      await id.open()
      await db.open()
      return resolve()
    }))
  }

  async _close () {
    return new Promise((async resolve => {
      await id.close()
      await db.close()
      return resolve()
    }))
  }

  genSalt (len=32) {
    return dwebsign.salt(len)
  }
  getSalt () {
    const { username, db } = this
    return db.getSalt(username)
  }
  storeSalt (salt) {
    const { username, db } = this
    return db.storeSalt(salt, username)
  }
  async hashPassword (password) {
    return new Promise(async resolve => {
      const salt = this.getSalt()
      scrypt(password, salt, {
        N: 16384,
        r: 8,
        p: 1,
        dkLen: 16,
        encoding: 'hex'
      }, (derivedKey) => {
        resolve(derivedKey)
      })
    })
  }

  async passwordToSeed (password) {
    const hash = await this.hashPassword(password)
    let mnemonic = bip39.entropyToMnemonic(hash)
    return bip39.mnemonicToSeedHex(mnemonic)
  }

  async passwordToMnemonic (password) {
    const hash = await this.hashPassword(password)
    return bip39.entropyToMnemonic(hash)
  }
 
  encrypt (data, seed) {
    return AES.encrypt(data, seed)
  }

  decrypt (data, seed) {
    return AES.decrypt(data, seed)
  }

  encryptSeed(pin, seed) {
    return this.encrypt(seed, pin)
  }
 
  getDecryptedSeed (pin) {
    const { username, db } = this
    let encryptedSeed
    db.getEncryptedSeed(username)
      .then(seed => encryptedSeed = seed)
      .catch(err => {return new Error(err)})
    return this.decrypt(encryptedSeed, pin)
  }

  verifyPassword (pin, password) {
    const seed = this.getDecryptedSeed(pin)
    const hash = await this.passwordToSeed(password)
    return seed === hash
  }

  storeSeed (seed) {
    const { username, db } = this
    db.addEncryptionSeed(seed, username)
      .then(data => {return data})
      .catch(err => {return false})
  }
  
  encryptSecretKey (pin, key) {
    const seed = this.getDecryptedSeed(pin)
    return this.encrypt(key, seed)
  }

  decryptSecretKey (pin, label) {
    const { id } = this
    const seed = this.getDecryptedSeed(pin)
    let secret
    id.getSecret(label)
      .then(data => {secret = data})
      .catch(err => {return false})
    return this.decrypt(secret, seed)
  }
}
