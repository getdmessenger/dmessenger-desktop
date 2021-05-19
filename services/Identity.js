import dwebsign from 'dwebsign'
import AES from 'aes-oop'
import bip39 from 'bip39'
import scrypt from 'scrypt-async'
import { PrivateDb } from './../services/PrivateDb'
import { getIdentityInstance } from './../identity/getIdentityInstance'

export default class Identity {
  constructor (opts = {}) {
    this.username = opts.username
    this.db = new PrivateDb()
    this.id = getIdentityInstance(opts.username)
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
    return new Promise( async resolve => {
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
        .catch(err => {throw new Error(err)})
  }
  encryptSecretKey (pin, key) {
    const seed = this.getDecryptedSeed(pin)
    return this.encrypt(key, seed)
  }
  decryptSecretKey  (pin, label) {
    const { id } = this
    const seed = this.getDecryptedSeed(pin)
    let secret
    id.getSecret(label)
       .then(data => secret = data)
       .catch(err => {throw new Error('SECRET_DOES_NOT_EXIST')})
    return this.decrypt(secret, seed)
  }
  async getSecret (label) {
    const { id } = this
    await id.getSecret(label)
                .then(secret => {return secret})
                .catch( err => {throw new Error('SECRET_DOES_NOT_EXIST')})
  }
  async addIdentitySecret (label , default, secretKey) {
    const { id } = this
    await id.addIdentitySecret(label, secretKey)
                .then( () => {return true})
                .catch(err => {throw new Error(err)})
  }
  async getDefaultUser() {
    const { id } = this
    await id.getDefaultUser()
                .then(value => {return value})
                .catch( () => {throw new Error('DEFAULT_ID_DOES_NOT_EXIST')})
  }
  async getRemoteUser (user) {
    const { id } = this
    await id.getRemoteUser(user)
                .then(value => {return value})
                .catch( () => {throw new Error('REMOTE_USER_DOES_NOT_EXIST')})
  }
  async getSubIdentity (label) {
    const { id } = this
    await id.getSubIdentity(label)
                .then(value => {return value})
                .catch(err => {throw new Error('SUB_ID_DOES_NOT_EXIST')})
  }
  async addSubIdentity (label, idData) {
    const { id } = this
    await id.addSubIdentity(label, idData)
                .then(d => {return d})
                .catch(err => {throw new Error(err)})
  }
  async addRemoteUser (opts) {
    const { id } = this
    id.addRemoteUser(opts)
       .then(d => {return d})
       .catch(err => {throw new Error(err)})
  }
  async addUserData (opts) {
    const { id, username } = this
    id.addUserData(opts)
       .then(d => {return d})
       .catch(err => {throw new Error(err)})
  }
  doesDefaultExist () {
    const { id } = this
    return id.doesDefaultExist()
  }
  getSeq () {
    const { id } = this
    id.getSeq()
       .then(seq => {return seq})
       .catch(err => {throw new Error(err)})
  }
  checkUserAvailability () {
    const { id } = this
    return id.checkUserAvailability()
  }
  async register (password, pin) {
    const { username, id } = this
    id.register()
       .then(d => {
         const { data, secretKey } = d
         const salt = this.genSalt()
         this.storeSalt(salt)
         const seed = await this.passwordToSeed(password)
         const encryptedSeed = this.encryptSeed(pin, seed)
         this.storeSeed(encryptedSeed)
         const encryptedSecretKey = this.encryptSecretKey(pin, secretKey)
         await this.addIdentitySecret('default', encryptedSecretKey)
         await this.addIdentityToPrivate(username, data)
         return data
       })
       .catch(err => {throw new Error(err)})
  }
  async addIdentityToPrivate (value) {
    const { username, db } = this
    await db.addIdentity(username, value) 
                 .then( () => {return true})
                 .catch(err => {throw new Error(err)})
  }
  async getIdentityFromPrivate (user) {
    const { db } = this
    await db.getIdentity(user)
                 .then(data => {return data})
                 .catch(err => {throw new Error(err)})    
  }
  async deleteIdentityFromPrivate () {
    const { username, db } = this
    await db.deleteIdentity(username)
                .then(() => {return true})
                .catch(err => {throw new Error(err)})
  }
  async removeIdentity (label) {
    const { id } = this
    await id.remoteIdentity(label)
                .then(() => {return true})
                .catch(() => {throw new Error('ID_DOES_NOT_EXIST')})
  }
  async addDevice () {
    const { id } = this
    id.addDevice()
       .then(data => {return data})
       .catch(err => {throw new Error(err)})
  }
  async listIdentities () {
    const { db } = this
    db.listIdentities()
        .then(data => {return data})
        .catch(err => {throw new Error(err)})
  }
}