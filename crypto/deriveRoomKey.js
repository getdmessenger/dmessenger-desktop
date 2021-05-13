/**
File: crypto/deriveRoomKey.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This derives the actual discovery key for a public chat room that is advertised on the DHT. It's where users swarm and exchange each other's local feeds related to the NeutronDB associated with the actual discovery key.
*/

import dcrypto from '@ddatabase/crypto'
import { deriveRootRoomKey } from './deriveRootRoomKey'

const MULTIFEED_NAMESPACE = '@multifeed:'

export default function deriveRoomKey (roomName) {
  let rootKey = deriveRootRoomKey(roomName)
  let roomKey = Buffer.from(MULTIFEED_NAMESPACE + rootKey)
  let roomDiscoveryKey = dcrypto.discoveryKey(roomKey)

  return roomDiscoveryKey
}