/**
File: Controller.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This is the most important file in the app itself. Controller is a nav bar at the top of the app but is much more than just that. This handles the management of state for pretty much everything except identity.
The controller handles: 
- Live streaming data from each public room, private room, and private chat DB, as it is peered and places it into React-based state that can be accessed by any of the other components (like the MessageWindow component, accessing message state).
- Managing connections with peers, on a per-DB basis, in order to download the most recent data
- Verifying message integrity, ensuring that they actually derived from the user mentioned in the actual data itself, before being stored in React-based state.
- Keeping peer counts for individual rooms (the amount of peers the app is connected with and replicating data from, on a room-by-room basis) and a global peer count as well (the total amount of peers the app is connected to).
- Handling auto-logouts and a user's latest known activity time.
- Handling a user's online/offline status.
- Responds to device/identity sync requests (SIEP).
- Responds to new private chat and private room invitations (PCAP)
*/

import crypto from 'crypto'
import memdb from 'memdb'
import pump from 'pump'
import list from '@neutrondb/list-view'
import SIEP from '@dwebid/simple-identity-exchange-protocol'
import PCAP from '@dmessenger/private-chat-authentication-protocol'
import { sign, verify } from '@ddatabase/crypto'
import { IdQuery } from '@dwebid/query'
import AES from 'aes-oop'
import { Badge,
             Button,
             Navbar } from 'react-bootstrap'
import { getLocalDb,
             getPrivateRoomDb,
             getIdentityDb,
             getPrivateChatDb } from './data'
import { NotificationService, Identity } from './services'
import { listPublicRooms,
             messageLegit,
             joinPrivateRoom,
             leavePrivateRoom,
             removePrivateRoomDb } from './helpers/roomHelpers'
import { checkAuth, authorizeKey } from './helpers/privateHelpers'
import { joinPrivateChat, leavePrivateChat } from './helpers/chatHelpers'
import { publishStatus } from './helpers/coreHelpers'
import { useIdentity, useMessenger } from './hooks'
import dswarmOpts from './opts/dSwarmOpts'
import { getManifestDb } from './data/getManifestDb'
import { isMessageDeleted, isUserBlocked } from './helpers/manifestHelpers'

export default function Controller () {
  const { currentIdentity, pin, pushDeviceId, clearPin, logoutUser, hasSeed, seed, resetSyncState } = useIdentity()
  const { publicRooms,
             setPublicRooms,
             privateRooms,
             setPrivateRooms,
             privateChats,
             setPrivateChats,
             peerCount,
             setPeerCount,
             roomPeerCounts,
             setRoomPeerCounts,
             publicRoomMessages,
             appendPublicRoomMessage,
             privateRoomMessages,
             appendPrivateRoomMessage,
             privateChatMessages,
             appendPrivateChatMessages,
             acceptedRooms,
             pushOnlineStatus,
             onlineStatus,
             activeTime,
             pushActiveTime } = useMessenger()

  const localDb = getLocalDb(currentIdentity)
  const nq = new NotificationService()

  /**
   COMMENT:
   This consistently checks whether or not a user is connected to the Internet, by attempting to fetch
    the Peeps website. If online or offline, the user's online status is published to their ID document under the 
    "apps/dmessenger/status" key, and within the `onlineStatus` React state.
  */

  useEffect(() => {
    fetch("https://peepsx.com")
      .then(response => {
        if (response.ok && response.headers.get("Content-Type") === "application/json") {
          publishStatus(currentIdentity, 'online')
          pushOnlineStatus('online')
        }
      })
      .catch(() =>{
        publishStatus(currentIdentity, 'offline')
        pushOnlineStatus('offline')
      })
  })

  /**
   COMMENT:
   This retrieves a constant stream of all private rooms, private chats & public rooms that are in the user's
   local DB & user's identity document and stores all data from the stream in state. On startup, a current list will
   be pulled and placed into state. While the user is using the app, they will be joining new rooms & accepting
   new private chats and these will immediately be placed in the stream and loaded into state. 
  */
  useEffect( () => {
    (async () => {
       let db = getLocalDb(currentIdentity)
       let iddb = getIdentityDb(currentIdentity)

       let privateRoomStream = db.createReadStream('/privateRooms/', {
         recursive: true
       })

       let privateChatStream = db.createReadStream('/privateChats/', {
         recursive: true
       })

       let publicRoomStream = iddb.createReadStream('/apps/dmessenger/publicRooms/', {
         recursive: true
       })

       privateRoomStream.on('data', n => {
         let data = n.value
         addPrivateRoom(...privateRooms, data)
       })

       publicRoomStream.on('data', n => {
         let data = n.value
         addPublicRoom(...publicRooms, data)
       })

       privateChatStream.on('data', data => {
         let data = n.value
         addPrivateChat(...privateChats, data)
       })
     })()
  }, [])

  /**
    COMMENT:
    When a user first starts up dMessenger, all swarm configurations related to all data types within the application
    (public rooms, private rooms, private chats and identity documents), which are stored in the user's local DB,
    are placed into state. Like above, when new rooms are joined, new swarm configurations are added
    to the stream, so that when this new data is added, it is also added to state. 
    After configurations are pulled, we startup the swarm for each configuration and begin replicating the data
    associated with these swarms. This also manages a live peer count for each individual connection/disconnection.
  */
    useEffect(() => {
      (async () => {
         const types = [
           "publicRoom", 
           "privateRoom",
           "privateChat",
           "publicManifest",
           "privateManifest",
           "identities"
         ]
         for (const type of types) {
           const stream = localDb.createReadStream(`/network/${type}`, {
             recursive: true
           })
           stream.on('data', n => {
             let data = n.value
             let db
             if (type === 'publicRoom') db = await getDb(data.roomName)
             if (type === 'privateRoom') db = await getPrivateRoomDb(data.roomName)
             if (type === 'identities') db = await getIdentityDb(data.username)
             if (type === 'privateChat') db = await getPrivateChatDb(data.username)
             if (type === 'privateManifest') db = await getManifestDb('private', data.roomName)
             if (type === 'publicManifest') db = await getManifestDb('public', data.roomName)
        
             let swarm = dswarm(dswarmOpts)
             swarm.join(data.discoveryKey, {
               lookup: data.lookup,
               announce: data.announce
             })
             swarm.on('connection', (socket, info) => {
               pump(
                 socket,
                 (type === 'publicRoom')
                   ? db.replicate(info.client, { live: true })
                   : db.replicate({ live: true }),
                 socket
               )
               setPeerCount(peerCount + 1)
               if (type === 'publicRoom' || type === 'privateRoom') {
                 let RN = data.roomName
                 let newCount = roomPeerCounts[RN] + 1
                 setRoomPeerCounts(...roomPeerCounts, [RN], newCount)
               }
             })
             swarm.on('disconnection', (socket, info) => {
               setPeerCount(peerCount - 1)
               if ((type === 'publicRoom') || type === 'privateRoom') {
                 let RN = data.roomName
                 let newCount = roomPeerCounts[RN] - 1
                 setRoomPeerCounts(...roomPeerCounts, [RN], newCount)
               }
             })
           })
         }
       })()
    }, [])

 /**
   COMMENT:
   Here we listen to each individual public room's database, retrieve the latest messages based on timestamp,
   verify the authenticity of the message (each message is signed with the user's private key) and then load
   that message into `publicMessage` state.
 */
   useEffect(() => {
    (async () => {
      const pRs = publicRooms
      for (const pR of pRs) {
        let db = getDb(pR.roomName)
        let chatView = list(memdb(), (msg, next) => {
          if (msg.value.type !== 'chat-message') return next()
          next(null, [msg.value.timestamp])
        })
        db.use('chat', chatView)
        db.api.chat.tail(2, msgs => {
          msgs.forEach((msg, i) => {
            if (messageLegit(msg.message, msg.signature, msg.username)
                 && !isUserBlocked(pR.roomName, 'publicRoom', msg.username)
                 && !isMessageDeleted('publicRoom', pR.roomName, msg.messageId)) {
              let message = {
                name: pR.roomName,
                from: msg.username,
                messageId: msg.messageId,
                message: msg.message,
                signature: msg.signature,
                isReply: msg.isReply,
                isReplyTo: msg.isReplyTo,
                timestamp: msg.timestamp
              }
              appendPublicRoomMessage(...publicRoomMessages, message)
              if (message.username !== currentIdentity) {
                nq.createNotification({
                  title: `New Message In @${pR.roomName}`,
                  body: `${message.username}: ${message.message}`,
                  roomName: pR.roomName
                }, 'new-public-room-message')
              }
            }
          })
        })
      }
    })()
  }, [publicRooms])

  /**
  COMMENT:
  Here we first retrieve all messages stored in each private room's database and store them in state.
  We then retrieve a live stream of all messages and compare them against the messages currently 
  stored in state. If they do not exists, we store them, as long as the message signature can be proven
  to have derived from the user's keypair (as published on dWeb's DHT).
  */
  useEffect(() => {
    (async () => {
      const pRs = privateRooms
      for (const pR of pRs) {
        let roomName = pR.roomName
        let db = getPrivateRoomDb(roomName)
        db.list('/messages/', { recursive: true }, (err, list) => {
          list.forEach(n => {
            let msg = n.value
            let messageId = msg.messageId
            let exists = privateRoomMessages.some(x => {
              x.messageId === messageId
            })
            if (!exists
                 && messageLegit(msg.message, msg.signature, msg.username)
                 && !isUserBlocked(roomName, 'privateRoom', msg.username)
                 && !isMessageDeleted('privateRoom', roomName, msg.messageId)) {
              let message = {
                name: roomName,
                from: msg.username,
                messageId: msg.messageId,
                message: msg.message,
                signature: msg.signature,
                isReply: msg.isReply,
                isReplyTo: msg.isReplyTo,
                timestamp: msg.timestamp
              }
              appendPrivateRoomMessage(...privateRoomMessages, message)
            }
          })
        })
        let stream = db.createReadStream('/messages/', {
          recursive: true
        })
  
        stream.on('data', n => {
          let data = n.value
          let messageId = data.messageId
          let exists = privateRoomMessages.some(x => {
            x.messageId === messageId
          })
          if (!exists
               && messageLegit(data.message, data.signature, data.username)
               && !isUserBlocked(roomName, 'privateRoom', data.username)
               && !isMessageDeleted('privateRoom', roomName, data.messageId)) {
             let message = {
               name: roomName,
               from: data.username,
               messageId: data.messageId,
               message: data.message,
               signature: data.signature,
               isReply: data.isReply,
               isReplyTo: data.isReplyTo,
               timestamp: data.timestamp
             }
             if (message.from !== currentIdentity) {
               nq.createNotification({
                 title: `New Message In Private Room @${roomName}`,
                 body: `@${user}: ${message.message}`,
                 roomName: roomName
               }, 'new-private-room-message')
             }
           }
        })
      }
    })()
   }, [privateRooms])


    /**
     COMMENT:
     This side effect does the same with private chat messages, by verifying each message and setting it in state.
    */

     useEffect(() => {
      (async () => {
        const pCs = privateChats
        for (const pC of pCs) {
          let user = pC.username
          let db = getPrivateChatDb(user)
          db.list('/messages/', { recursive: true }, (err, list) => {
            list.forEach(n => {
              let msg = n.value
              let messageId = msg.messageId
              let exists = privateRoomMessages.some(x => {
                x.messageId === messageId
              })
              if (!exists) {
                let message = {
                  name: user,
                  from: msg.username,
                  messageId: msg.messageId,
                  message: msg.message,
                  signature: msg.signature,
                  isReply: msg.isReply,
                  isReplyTo: msg.isReplyTo,
                  timestamp: timestamp
                }
                appendPrivateChatMessage(...privateChatMessages, message)
              }
            })
          })
    
          let stream = db.createReadStream('/messages/', { recursive: true })
          stream.on('data', n => {
            let data = n.value
            let messageId = data.messageId
            let exists = privateChatMessages.some(x => {
              x.messageId === messageId
            })
            if (!exists) {
              let message = {
                name: user,
                from: data.username,
                messageId: messageId,
                message: data.message,
                signature: data.signature,
                isReply: data.isReply,
                isReplyTo: data.isReplyTo,
                timestamp: timestamp
              }
              if (messageLegit(data.message, data.signature, data.user)) {
                appendPrivateChatMessage(...privateChatMessages, message)
                if (message.from !== currentIdentity) {
                  nq.createNotification({
                    title: `New MEssage From @${user}`,
                    body: `@${user}: ${message.message}`,
                    chatUser: user
                  }, 'new-private-chat-message')
                }
              }
            }
          })
        }
      })()
    }, [privateChats])
  
      /**
      COMMENT:
      This checks the current time and the most recent activity time, and logs out the user/clears the pin state,
      if it has been over 15 minutes.
      */
  
      useEffect( () => {
        (async () => {
          const now = new Date()
          const diff = now - activeTime
          if (diff > 900000) {
            clearPin()
            logoutUser()
          }
        })()
      })
  
      /** 
      COMMENT:
      This resets the most recent activity time, each time a page loads. Since the Controller is a bar at the top of
      each page, this resets the most recent activity time, each time a user goes to a new page.
      */
  
      useEffect( () => {
        pushActiveTime(new Date())
      }, [])
  
      /**
      COMMENT:
      The initiator of a SIEP request, does so using the SyncInit page (pages/SyncInit.js). The initiator 
      looks up the deviceID found in a user's identity document, on dWeb's DHT, and then starts a protocol
      stream with any devices found under that device ID. Below, a device listens over their deviceID for 
      SIEP requests and responds to specific messages. It is able to verify the device code (generated by 
      the controller on startup) and release a seed to the initiator, as long as the device code is verified.
      It also authorizes the local key sent by the initator, as long as the proof has been satisfied.
      */
  
      useEffect(() => {
       (async () => {
         const receiverProtocolStream = new SIEP(false, {
           encrypted: true,
           noise: true,
  
           onopen (channel, message) {
             let syncUser = message.user
             nq.createNotification({
               title: "New Device Sync Request",
               body: "A device is attempting to ask you for identity authorization."
             }, 'new-device-sync-request')
             setSyncingUser(syncUser)
             while (!syncAccepted) console.log('waiting on sync acceptance')
             receiverProtocolStream.verify(1, { type: "device-verification" })
           },
  
           onproof (channel, message) {
             let secret = message.secret
             if (secret === deviceCode) {
               setSyncStatus('device-confirmed')
             }  else {
               resetSyncState()
               receiverProtocolStream.destroy()
             }
             while (!hasSeed) console.log('waiting on seed')
             receiverProtocolStream.releaseseed(1, { seed: seed })
             setSyncStatus('waiting-on-key')
           },
  
           onprovidekey (channel, message) {
             setSyncStatus('authorizing-key')
             let key = message.diffKey
             authorizeKey(key, syncUser)
             while (!checkAuth(key, syncUser)) authorizeKey(key, syncUser)
             resetSyncState()
           },
           onclose (){
             resetSyncState()
             receiverProtocolStream.destroy()
           }
         })
  
         let swarm = dswarm(dswarmOpts)
  
         swarm.join(deviceId, {
           lookup: true,
           announce: true
         })
  
         swarm.on('connection', (socket, info) => {
           pump(socket, receiverProtocolStream, socket)
         })
       })()
      }, [])
  
      /**
      COMMENT:
        Like how SIEP requests are handled in the side effect above, this manages PCAP
       (Private Chat Authorization Protocol) requests. When a user invites a user to a private room or 
       a private chat, the user is looked up on the DHT under their discovery key (a key that derives from
       their username) and a PCAP request is sent to that user. This effect listens for connections on a user's 
       key and responds to those requests. Users are able to verify each other, via digital signatures, by signing
       the roomName or their username, with the private key, associated with the public key that is published on
       the DHT under their user record. Users exchange a seed, which is used to encrypt messages in a private room
       or private chat, so that if outsiders get their hands on the data, they are unable to do anything with it,
       without the encryption seed. AES encryption is used.
  
       More on how this works via [docs/private-chat-authorization-protocol.md].
        
      */
      useEffect( () => {
        (async () => {
          const pcapReceiver = new PCAP(false, {
            encrypted: true,
            noise: true,
            oninvite (channel, message) {
              let signature = message.signature
              let roomKey = message.roomKey
              let query = new IdQuery(message.creator)
              let userKey = await query.getRemoteKey('publicKey')
              let verified = verify(message.name, signature, userKey)
              if (verified) {
                if (message.type === 'privateRoom') {
                  await joinPrivateRoom(currentIdentity, {
                    swarm: {
                      lookup: true,
                      announce: true,
                      discoveryKey: message.discoveryKey
                    },
                    creator: false,
                    roomName: message.name
                  })
                  nq.createNotification({
                    title: "New Private Room Invite!",
                    body: `${message.creator} has invited you. Click to accept!`,
                    roomName: message.name
                  }, 'new-private-room-invite')
                  let db = getPrivateRoomDb(message.name)
                  let localKey = db.local.key.toString('hex')
                  let secret = id.decryptSecretKey('default', pin)
                  let signature = sign(message.name, secret)
                  let attempts = 0
                  while (attempts <= 3000 && !acceptedRooms.includes(message.name)) {
                    setTimeout(() => {
                      ++attempts
                    }, 10000)
                  }
                  if (attempts >= 3000 && !acceptedRooms.includes(message.name)) {
                    pcapReceiver.refuse(1, {
                      responder: currentIdentity,
                      signature: signature
                    })
                    await removePrivateRoomDb(message.name)
                    await leavePrivateRoom(currentIdentity, message.publicKey, message.name)
                  }  else {
                    pcapReceiver.accept(1, {
                      localPublicKey: localKey,
                      responder: currentIdentity,
                      signature: signature
                    })
                  }
                }  else if (message.type === 'privateChat') {
                     await joinPrivateChat(currentIdentity, {
                       swarm: {
                         lookup: true,
                         announce: true,
                         discoveryKey: message.discoveryKey
                       },
                       creator: false,
                       username: message.name
                     })
                     nq.createNotification({
                       title: "New Private Chat Requested!",
                       body: `${message.name} wants to have a private, encrypted convo.`,
                       user: message.name
                     }, 'new-private-chat-invite')
                     let db = getPrivateChatDb(message.name)
                     let localKey = db.local.key.toString('hex')
                     let secret = id.decryptSecretKey('default', pin)
                     let attempts = 0
                     while (attempts <= 3000 && !acceptedChats.includes(message.name)) {
                       setTimeout(() => {
                         ++attempts
                       }, 10000)
                     }
                     if (attempts >= 3000 && !acceptedChats.includes(message.name)) {
                       pcapReceiver.refuse(1, {
                         responder: currentIdentity,
                         signature: signature
                       })
                       await removePrivateChatDb(message.name)
                       await leavePrivateChat(currentIdentity, message.publicKey, message.name)
                     }  else {
                       pcapReceiver.accept(1, {
                         localPublicKey: localKey,
                         responder: currentIdentity,
                         signature: signature
                       })
                     }
               }
              }  else {
                    pcapReceiver.destroy()  // if not verified, destroy stream
              }
            },
  
            onauthorized (channel, message) {
              let type = message.type
              let seed = AES.encrypt(message.seed, pin)
              if (type === 'privateRoom') await localDb.savePrivateRoomSeed(message.name, seed)
              if (type === 'privateChat') await localDb.savePrivateChatSeed(message.name, seed)
              else pcapReceiver.destroy()
            },
  
            onclose (channel, message) {
              pcapReceiver.destroy()
            }
          })
  
          let userDk = crypto.createHash('sha256').update(currentIdentity).digest()
          let swarm = dswarm()
          swarm.join(userDk, {
            lookup: true,
            announce: true
          })
  
          swarm.on('connection', (socket, info) => {
            pump(socket, pcapReceiver, socket)
          })
        })()
      }, [])
  
    return (
        <>
      <Navbar bg="dark" expand="lg">
        <Navbar.Brand href="/home">PeerBar &trade;</Navbar.Brand>
         <Button
           variant = {(onlineStatus === 'online')
             ? variant="success"><Badge variant="light">Online</Badge>
             : variant="danger"><Badge variant="light">Offline</Badge>
         }>
         </Button>
         <Button variant="outline-light">
           Peers Connected <Badge variant="success">{peerCount}</Badge>
         </Button>
      </Navbar>
      </>
    )
  }