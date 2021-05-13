/**
File: crypto/deriveRootRoomKey.js
Author: Jared Rice Sr.
Description: Exports a module that enables the creation of a public room's rootKey, which is ultimately derived from the passed-in roomName.
*/

export default function deriveRootRoomKey (roomName) {
    let rootKey = crypto.createHash('sha256')
                         .update(roomName)
                         .digest()
  
    return rootKey
  }