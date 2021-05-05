/**
File: dhub/index.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: dMessenger Desktop uses dHub in the background, to manage appending to and replicating data structures. This file exports the dHub client so that it can be directly accessed by any of dMessenger's components and also initiates a dHub server, in the event that it's offline.
*/

import { Client, Server } from 'dhub'

const NUM_RETRIES = 50
const RETRY_DELAY = 100

var clients = new Map()
var running = new Set()

export async function setup() {
  await setupClient('dhub', 'DHub', () => new Client())
}

async function setupClient (name, readable, clientFunc) {
  let retries = 0 
  while (!clients.get(name) && retries++ < NUM_RETRIES) {
    try {
      const client = clientFunc()
      await client.ready()
      clients.set(name, client)
    } catch {
      if (!running.has(name)) {
        const server = new Server()
        await server.ready()
        await client.ready()
        running.add(name)
      }
      await wait(RETRY_DELAY * retries)
    }
  }
  if (!clients.has(name)) throw new Error(`Could not connect to ${readable} daemon`)
  const cleanup = async () => {
    const client = clients.get(name)
    if (client) await client.close()
  }
  process.once('SIGINT', cleanup)
  process.once('SIGTERM', cleanup)
}

function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getClient() {
  return clients.get('dhub')
}