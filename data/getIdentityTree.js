/**
File: data/getIdentityTree.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module retrieves the multi dTree that is used for storing a user's identity document.
*/

import MultiDTree from 'multi-dwebtree'
import { dTreeOpts } from './../opts/dTreeOpts'
import { getIdentity } from './getIdentityBase'

export default async function getIdentityTree (username) {
  if (!username)
    throw new Error("Username is required to derive dTree's dDatabase")

  const base = await getIdentityBase(username)
  const multiDTree = new MultiDTree(base, dTreeOpts)
  return multiDTree
}