import Networker from '@basestore/networker'
import { getStoreInstance } from './../data/getStoreInstance'
import { getIdentityStoreInstance } from './../data/getIdentityStoreInstance'
import { networkOpts } from './../opts/networkOpts'

export default function getNetworker (type) {
  const localStore = getStoreInstance()
  const identityStore = getIdentityStoreInstance()
  const storeType = isLocal(type) ? localStore : identityStore
  const networker = new Networker(storeType, networkOpts)
  return networker
}
function isLocal (type) {
  if (type === 'local') return true
  if (type === 'id') return false
  else return new Error('INVALID_NETWORK_TYPE')
}