import path from 'path'
import fs from 'fs'
import { IdQuery } from '@dwebid/query'
import { PrivateDb } from './../services/PrivateDb'
import { getIdentityInstance } from './../identity/getIdentityInstance'
import { ID_DIR } from './../config'

export async function identityExists (user) {
  let idLocation = path.join(ID_DIR, user)
  try {
    await fs.access(idLocation)
    return true
  }  catch {
    return false
  }
}

export async function identitiesExist () {
  let db = new PrivateDb()
  await db.listIdentities()
              .then(()=>{return (true)})
              .catch(() => {return false})
}

export async function compareKeys (username) {
  return new Promise((resolve, reject) => {
    if (identityExists(username)) {
      const query = new IdQuery(username)
      let mk, lk
      query.getRemoteKey('publicKey')
              .then(d => mk = d)
              .catch(mk = false)
      if (!mk) return reject(new Error('Username was not found on the DHT'))
      const mkBuf = (Buffer.isBuffer(mk)) ? mk : Buffer.from(mk, 'hex')
      let db = await getDb(username)
      if (!db) return reject(new Error('Identity document does not exist locally'))  // we might not need this
      lk = db.local.key
      const lkBuf = (Buffer.isBuffer(lk)) ? lk : Buffer.from(lk, 'hex')
      return resolve(Buffer.compare(mkBuf, lkBuf))
    }  else {
      return reject(new Error('Identity document does not exist locally'))
    }
  })
}

export async function isAuthorized (username) {
  if (compareKeys(username)) return true
  if (!compareKeys(username)) {
    let db = getDb(username)
    let lk = db.local.key
    db.authorized(lk, (err, auth) => {
      if (err) return false
      else if (auth === true) return true
      else return false
    })
  }
}

export const getDb = async (username) => {
  if (identityExists(username)) {
    const id = await getIdentityInstance(username, {})
    let db
    await id.getDb()
                .then(d => db = d)
                .catch(db = false)
    return db   
  }  else {
    return reject(new Error('Identity does not exist locally'))
  }
}