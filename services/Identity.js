import EventEmitter from 'events'
import dwebsign from 'dwebsign'
import AES from 'aes-oop'
import bip39 from 'bip39'
import scrypt from 'scypt-async'
import { PrivateDb } from './../services/PrivateDb'
import { getIdentityInstance } from './../identity/getIdentityInstance'
import { generateIdError } from './../hooks/idErrorHandler'
import { pin, pinStatus, clearPin, loginUser } from './../hooks/useIdentity'

export default class Identity extends EventEmitter {
  constructor (opts = {}) {
    this.username = username
    this.db = new PrivateDb()
    this.id = getIdentityInstance(opts.username)
  }
  _handleError (err) {
    generateIdError(err)
    this.emit('error', err)
    throw new Error(err)
  }
  genSalt (len = 32) {
    return dwebsign.salt(len)
  }
  getSalt () {
    const { username, db } = this
    db.getSalt(username)
        .then(node => {return node})
        .catch(err => this._handleError(err))
  }
  storeSalt (salt) {
    const { username, db } = this
    db.storeSalt(salt, username)
       .catch(err => this._handleError(err))
  }
  async hashPassword (password) {
    return new Promise (async resolve => {
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
  encryptSeed (seed) {
    if (!pinStatus) return
    return this.encrypt(seed, pin)
  }
  getDecryptedSeed () {
    if (!pinStatus) return
    const { username, db } = this
    let encryptedSeed
    db.getEncryptedSeed(username)
        .then(seed => encryptedSeed = seed)
        .catch(err => this._handleError(err))
    return this.decrypt(encryptedSeed, pin)
  }
  verifyPassword (password) {
    const seed = this.getDecryptedSeed()
    const hash = await this.passwordToSeed(password)
    return seed === hash
  }
  storeSeed (seed) {
    const { username, db } = this
    db.addEncryptionSeed(seed, username)
        .catch(err => this._handleError(err))
  }
  encryptSecretKey (key) {
    if (!pinStatus) return
    const seed = this.getDecryptedSeed(pin)
    return this.encrypt(key, seed)
  }
  decryptSecretKey (label) {
    if (!pinStatus) return
    const { id } = this
    const seed = this.getDecryptedSeed(pin)
    let secret
    id.getSecret(label)
       .then(data => secret = data)
       .catch(this._handleError('SECRET_DOES_NOT_EXIST'))
    return this.decrypt(secret, seed)
  }
  async getSecret (label) {
    const { id } = this
    await id.getSecret(label)
                .then(secret => {return secret})
                .catch(this._handleError('SECRET_DOES_NOT_EXIST'))
  }
  async addIdentitySecret (label = 'default', secretKey) {
    const { id } = this
    await id.addIdentitySecret(label, secretKey)
                .catch(err => this._handleError(err))
  }
  async getDefaultUser () {
    const { id } = this
    await id.getDefaultUser()
                .then(value => {return value})
                .catch(this._handleError('DEFAULT_ID_DOES_NOT_EXIST'))
  }
  async getRemoteUser (user) {
    const { id } = this
    await id.getRemoteUser(user)
                .then(value => {return value})
                .catch(this._handleError('REMOTE_USER_DOES_NOT_EXIST'))
  }
  async getRemoteUsers () {
    const { id } = this
    return id.getRemoteUsers()
  }
  async getSubIdentity (label) {
    const { id } = this
    await id.getSubIdentity(label)
                .then(value => {return value})
                .catch(this._handleError('SUB_ID_DOES_NOT_EXIST'))
  }
  async addSubIdentity (label, idData) {
    const { id } = this
    await id.addSubIdentity(label, idData)
                .catch(err => this._handleError(err))
  }
  async addRemoteUser (opts) {
    const { id } = this
    id.addRemoteUser(opts)
       .catch(err => this._handleError(err))
  }
  doesDefaultExist () {
    const { id } = this
    return id.doesDefaultExist()
  }
  getSeq () {
    const { id } = this
    id.getSeq()
       .then(seq => {return seq})
       .catch(err => this._handleError(err))
  }
  checkAvailability () {
    const { id } = this
    return id.checkUserAvailability()
  }
  async register (password) {
    if (!pinStatus) return
    const { username, id } = this
    id.register()
       .then(d => {
         const { data, secretKey } = d
         const salt = this.genSalt()
         this.storeSalt(salt)
         const seed = await this.passwordToSeed(password)
         const encryptedSeed = this.encryptedSeed(pin, seed)
         this.storeSeed(encryptedSeed)
         const encryptedSecretKey = this.encryptSecretKey(pin, secretKey)
         await this.addIdentitySecret('default', encryptedSecretKey)
         await this.addIdentityToPrivate(username, data)
         loginUser(username)
         clearPin()
       })
       .catch(err => this._handleError(err))
  }
  async addIdentityToPrivate (value) {
    const { username, db } = this
    await db.addIdentity(username, value)
                 .catch(err => this._handleError(err))
  }
  async getIdentityFromPrivate () {
    const { username, db } = this
    await db.getIdentity(username)
                 .then(data => {return data})
                 .catch(err => this._handleError(err))
  }
  async deleteIdentityFromPrivate () {
    const { username, db } = this
    await db.deleteIdentity(username)
                 .catch(err => this._handleError(err))
  }
  async removeIdentity (label) {
    const { id } = this
    await id.removeIdentity(label)
                .catch((err)=>{this._handleError('ID_DOES_NOT_EXIST')})
  }
  async addDevice () {
    const { id } = this
    id.addDevice()
       .catch(err => this._handleError(err))
  }
  async listIdentities () {
    const { db } = this
    db.listIdentities()
        .then(data => {return data})
        .catch(err => this._handleError(err))
  }
}