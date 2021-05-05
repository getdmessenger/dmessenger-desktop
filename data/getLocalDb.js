/**
File: data/getLocalDb.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This file generates a "Multi-dTree" (A multi-writer dTree) that is stored within the dDatabase imported from the ./getLocalBase module. This local database can be synced between a user's devices (See docs/syncing-local-db-between-devices.md), since it's completely distributed. Multiple devices can write to the dTree, as long as they're authorized to do so. The creator of the dTree can authorize other peers (devices) to write to the dTree, along as they meet verification requirements (classes/Sync.js).
*/

import MultiDTree from 'multi-dwebtree'
import { dTreeOpts } from './../opts/dTreeOpts'
import { getLocalBase } from './getLocalBase'

export default async function getLocalDb (username) {
  if (!username)  throw new Error("Username is required to derive dTree's dDatabase.")

  const base = await getLocalBase(username)
  const multiDTree = new MultiDTree(base, dTreeOpts)
  return multiDTree
}