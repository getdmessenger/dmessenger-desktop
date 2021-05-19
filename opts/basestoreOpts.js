/**
File: opts/basestoreOpts.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This module exports opts that are used within all Basestore instances.
*/

import { DDatabaseCache } from '@ddatabase/cache'
import {
  TOTAL_CACHE_SIZE,
  CACHE_RATIO,
  TREE_CACHE_SIZE,
   DATA_CACHE_SIZE
} from './../config'

export default basestoreOpts = {
  cacheSize: {
    sparse: true,
    stats: true,
    cache: {
      data: new DDatabaseCache({
        maxByteSize: DATA_CACHE_SIZE,
        estimateSize: val => val.length
      }),
      tree: new DDatabaseCache({
        maxByteSize: TREE_CACHE_SIZE,
        estimateZize: val => 40
      })
    }
  },
  isAvailable: true
}