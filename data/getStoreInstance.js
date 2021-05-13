/**
File: data/getStoreInstance.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports a new Basestore instance. 
*/

import Basestore from 'basestorex'
import { BASE_LOCATION } from './../config'
import { basestoreOpts } from './../opts/basestoreOpts'

export default function getStoreInstance () {
  const store = new Basestore(BASE_LOCATION, basestoreOpts)
  return store
}