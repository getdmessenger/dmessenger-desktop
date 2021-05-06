/**
File: util/promise-async.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This file exports a function that converts a synchronous function into an asynchronous one using setTimeout, by wrapping it in a promise. This does not expect the function to have a callback parameter.
*/

export default promiseAsync = func => (
    (...args) => (
      new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            resolve(func(...args))
          } catch (err) {
            reject(err)
          }
        })
      })
    )
  )