/**
File: swarm/utilities/deriveKey.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is used to derive a SHA256 hash, from a specific room name or username within dMessenger. This makes it easy to lookup room names and usernames on dWeb's DHT, by simply deriving the DHT entry's key from the actual string-based name itself.
*/

import crypto from 'crypto'

export default function deriveKey (name) {
  const key = crypto.createHash('sha256')
                           .update(name)
                           .digest()

  return key
}