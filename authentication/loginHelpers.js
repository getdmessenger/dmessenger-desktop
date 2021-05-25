import { IdQuery } from '@dwebid/query'
import { getIdentityInstance } from './../identity/getIdentityInstance'
import { identityExists } from './identityExists'

export const checkAvailability = username => {
  const query = new IdQuery(username)
  return query.checkAvailability()
}

export const getIdKey = async username => {
  const query = new IdQuery(username)
  await query.getRemoteKey('publicKey')
                   .then((d) => {return d})
}

export async function initAndCheckId (username) {
  const idKey = await getIdKey(username)
  const id = await getIdentityInstance(username, {
    key: idKey
  })
  await id.open()
  while (!id.doesDefaultExist()) {
    setTimeout(() => {
      console.log('Attempting to sync ID...')
    }, 3000)
  }
  return true
}