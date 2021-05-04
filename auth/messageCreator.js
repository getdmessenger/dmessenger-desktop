// This is used for creating a message object, that are passed between peers attempting
// to authenticate themselves over PeerSockets. These messages are used in the auth process.

export default function messageCreator (opts) {
    if (!opts.type) {
      throw new Error('Auth Message Error: type must exist')
    }
    if (!opts.message) {
      throw new Error('Auth Message Error: message must exist')
    }
    if (!opts.sender) {
      throw new Error('Auth Message Error: sender must exist')
    }
  
    let mO = {}
    mO.type = opts.type
    mO.sender = opts.sender
    mO.message = opts.message
  
    return mO
  }
  
  // Example Usage
  // import { messageCreator } from './auth/messageCreator'
  // messageCreator({
  //   type: "initiate",
  //   sender: "@jared",
  //   message: "encryptedPayload"
  // })