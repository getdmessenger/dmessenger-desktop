import { SWARM_PORT, MAX_PEERS } from './../config'

export const networkOpts = {
  announceLocalNetwork: true,
  preferredPort: SWARM_PORT,
  maxPeers: MAX_PEERS
}