/**
File: swarm/getDhtNode.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Creates a USwarm-based DHT instance and saves the instance in a Map and exports a function that sets up the DHT node and retrieves its instance.
*/
import { USwarm } from '@uswarm/core'
import { dhtOpts } from './../opts/dhtOpts'

var nodes = new Map()

async function setup() {
  await setupNode('dht', () => new USwarm(dhtOpts))
}

async function setupNode (name, nodeFunc) {
  while (!nodes.get(name)) {
    try {
      const node = nodeFunc()
      nodes.set(name, node)
    } catch (err) {
      throw new Error(err)
    }
  }
}

function getNode() {
  return nodes.get('dht')
}

export function getDhtNode () {
  setup()
  const node = getNode()
  return node
}