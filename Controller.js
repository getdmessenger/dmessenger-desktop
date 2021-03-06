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

import React, { useState, useEffect } from 'react'
import crypto from 'crypto'
import memdb from 'memdb'
import pump from 'pump'
import list from '@neutrondb/list-view'
import SIEP from '@dwebid/simple-identity-exchange-protocol'
import PCAP from '@dmessenger/pcap'
import SMAP from '@dmessenger/smap'
import { sign, verify } from '@ddatabase/crypto'
import { IdQuery } from '@dwebid/query'
import AES from 'aes-oop'
import { Badge, Button, NavBar } from 'react-bootstrap'
import { getLocalDb,
             getPrivateDb,
             getDb,
             getManifestDb,
             getPrivateRoomDb,
             getIdentityDb,
             getPrivateChatDb } from './data'
import { NotificationService,
             ReplicationDb,
             Identity } from './services'
import { listPublicRooms,
             messageLegit,
             joinPrivateRoom,
             leavePrivateRoom,
             removePrivateRoomDb } from './helpers/roomHelpers'
import { checkAuth, authorizeKey } from './helpers/siepHelpers'
import { joinPrivateChat, leavePrivateChat } from './helpers/chatHelpers'
import { isMessageDeleted, isUserBlocked } from './helpers/manifestHelpers'
import { publicStatus } from './helpers/chatHelpers'
import { useIdentity, useMessenger } from './hooks'
import dswarmOpts from './opts/dSwarmOpts'

import fs from 'fs'
import path from 'path'
import { DEVICE_DIR } from './config'

export default function Controller () {
  const { currentIdentity, pin, pushDeviceId, clearPin, logoutUser, hasSeed, seed, resetSyncState, config, setConfig } = useIdentity()
  const {
    setPublicRoomMessages,
    publicRoomMessages,
    setPrivateRoomMessages,
    privateRoomMessages,
    setPrivateChatMessages,
    privateChatMessages,
    deletePublicRoomMessage,
    deletePrivateRoomMessage,
    deletePrivateChatMessage,
    editPublicRoomMessage,
    editPrivateRoomMessage,
    editPrivateChatMessage,
    sortMessages,
    roomPeerCounts,
    setRoomPeerCounts,
    peerCount,
    setPeerCount,
    onlineStatus,
    pushOnlineStatus,
    activeTime,
    pushActiveTime,
    acceptedRooms
  } = useMessenger()

  const [ deviceRestart, setDeviceRestart ] = useState()

  const localDb = getLocalDb(currentIdentity)
  const nq = new NotificationService()

  let privateDb = await getPrivateDb()
  let streamService = new ReplicationDb(currentIdentity)

  const handleRemoveStream = async stream => {
    await streamService.removeStream(stream.type, stream.name, stream.intendedReceiver)
  }


  // When the auto-logout time has passed, clear the pin from state and logout the user
useEffect( () => {
  (async () => {
    const configPeriod = config.autoLogoutTime
    const now = new Date()
    const periodInMs = configPeriod * 60 * 1000
    const diff = now - activeTime
    if (diff > periodInMs) {
      clearPin()
      logoutUser()
    }
  })()
})

// rest the most recent active time, on each page-load
useEffect(() => {
  pushActiveTime(new Date())
}, [])

// load the user's default settings from their localDb
useEffect(() => {
  (async () => {
    let configValues = await localDb.getSettings()
    if (configValues.defaultCurrency) {
      setConfig(configValues)
    } else {
      setConfig({
        defaultCurrency: 'USD',
        defaultLanguage: 'EN',
        autoLogoutTime: 15
      })
    }
  })()
})

// Generate a random device code, used for device-to-device identity syncing/authorization
useEffect(() => {
  const getRandomNumber = max => {
    let random
    random = Math.random() // value >= 0.0 and < 1.0
    random = Math.floor(random * max)
    random = random + 1
    return random
  }
  const getRandomEight = () => {
    let result = []
    while (result.length - 1 !== 8) {
      let randomNum = getRandomNumber(9)
      result.push(randomNum)
    }
    let numToString = result.join()
    return Number(numToString)
  }

  let randomEight = getRandomEight()
  setDeviceCode(randomEight)
}, [])

// Generate new deviceId or set current deviceId in state
useEffect(() => {
  (async () => {
    const cwd = DEVICE_DIR
    fs.stat(cwd, (err, stat) => {
      if (err) fs.mkdir(cwd)
    })
    let deviceFiles = []
    fs.promises.readdir(cwd, { withFileTypes: true })
       .then(entries => {
         entries.filter(entry => entry.isFile())
         .map(entry => entry.name)
         .forEach(name => deviceFiles.push(path.join(cwd, name)))
    if (!deviceFiles.length) {
      let randomDeviceId = crypto.randomBytes(32)
      setDeviceId(randomDeviceId)
      const deviceFilename = `${randomDeviceId}.device`
      const deviceFile = path.join(cwd, deviceFilename)
      fs.stat(deviceFile, (err, stat) => {
        if (err) {
          const deviceFileData = {
            deviceId: randomDeviceId,
            label: os.type(),
            user: currentIdentity
          }
          const dfd = JSON.stringify(deviceFileData)
          fs.writeFile(deviceFile, dfd)
        }
      })
    }  else {
      // get deviceId from file and set in state
      fs.readFileSync(deviceFiles[0], "utf8", (err, text) => {
        if (err) setDeviceRestart(true)
        let data = null
        try {
          data = JSON.parse(text)
          setDeviceId(data.deviceId)
        } catch (e) {
          setDeviceRestart(true)
        }
      })
    }
       })
  })()
}, [deviceRestart])

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
   useEffect(() => {
    (async () => {
      // retrieve actual database instance from the LocalDB service, for the purpose of streaming private room/chat lists.
      let db = localDb.getDb()
      // we can get the actual database instance off the identity document using getIdentityDb()
      // NOTE: we should probably create a get() helper for doing this with the localDb in the future.
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
  
      privateChatStream.on('data', n => {
        let data = n.value
        addPrivateChat(...privateChats, data)
      })
  
      publicRoomStream.on('data', n => {
        let data = n.value
        addPublicRoom(...publicRooms, data)
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
          const stream = localDb.listStreamSwarms(type)
           stream.on('data', n => {
             let data = n.value
             let db
             if (type === 'publicRoom') db = await getDb(data.roomName)
             if (type === 'privateRoom') db = await getPrivateRoomDb(data.roomName)
             if (type === 'identities') db = await getIdentityDb(data.username)
             if (type === 'privateChat') db = await getPrivateChatDb(data.username)
             if (type === 'privateManifest') db = await getManifestDb('privateRoom', data.roomName)
             if (type === 'publicManifest') db = await getManifestDb('publicRoom', data.roomName)
        
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
          if (msg.value.type !== 'chat-message' || msg.value.deleted) return next()
          next(null, [msg.value.timestamp])
        })
        db.use('chat', chatView)
        db.api.chat.tail(2, msgs => {
          msgs.forEach((msg, i) => {
            if (messageLegit(msg.message, msg.signature, msg.username) 
                 && !isUserBlocked(pR.roomName, 'publicRoom', msg.username)
                  && !isMessageDeleted('publicRoom', pR.roomName, msg.messageId)) {            
              setPublicRoomMessages(...publicRoomMessages, msg)
              if (msg.username !== currentIdentity) {
                nq.createNotification({
                  title: `New Message In @${pR.roomName}`,
                  body: `${msg.username}: ${msg.message}`,
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
              setPrivateRoomMessages(...privateRoomMessages, msg)
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
                 setPrivateRoomMessages(...privateRoomMessages, data)
          }
          if (data.from !== currentIdentity) {
            nq.createNotification({
              title: `New Message In Private Room @${roomName}`,
              body: `@${data.username}: ${data.message}`,
              roomName: roomName
            }, 'new-private-room-message')
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
                setPrivateChatMessages(...privateChatMessages, msg) 
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
            if (!exists && messageLegit(data.message, data.signature, data.user)) {
              setPrivateChatMessages(...privateChatMessages, data)
              if (data.from !== currentIdentity) {
                nq.createNotification({
                  title: `New Message From @${data.username}`,
                  body: `@${user}: ${data.message}`,
                  chatUser: data.username
                }, 'new-private-chat-message')
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
  
      // useEffect( () => {
      //   (async () => {
      //     const now = new Date()
      //     const diff = now - activeTime
      //     if (diff > 900000) {
      //       clearPin()
      //       logoutUser()
      //     }
      //   })()
      // })
  
      /** 
      COMMENT:
      This resets the most recent activity time, each time a page loads. Since the Controller is a bar at the top of
      each page, this resets the most recent activity time, each time a user goes to a new page.
      */
  
      // useEffect( () => {
      //   pushActiveTime(new Date())
      // }, [])
  
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

      useEffect(() => {
        (async () => {
          const pRs = publicRooms
          for (const pR of pRs) {
            let db = getDb(pR.roomName)
            let deletedView = list(memdb(), (msg, next) => {
              if (msg.value.type !== 'deleted-message') return next()
              next(null, [msg.value.timestamp])
            })
            let editedView = list (memdb(), (msg, next) => {
              if (msg.value.type !== 'edited-message') return next()
              next(null, [msg.value.timestamp])
            })
            db.use('deletedMsg', deletedView)
            db.use('editedMsg', editedView)
            db.api.deletedMsg.tail(2, msgs => {
              msgs.forEach((msg, i) => {
                if (messageLegit(msg.messageId, msg.signature, msg.username)) {
                  let exists = publicRoomMessages.some(x => {
                    x.messageId === msg.messageId
                  })
                  if (exists) {
                    deletePublicRoomMessage(msg.messageId)
                  }
                }
              })
            })
            db.api.editedMsg.tail(2, msgs => {
              msgs.forEach((msg, i) => {
                if (messageLegit(msg.messageId, msg.signature, msg.username)) {
                  let exists = publicRoomMessages.some(x => {
                    x.messageId === msg.messageId
                  })
                  if (exists) {
                    editPublicRoomMessage(msg)
                  }
                }
              })
            })
          }
        })()
      }, [])
      
      useEffect(() => {
        (async () => {
          const pRs = privateRooms
          for (const pR of pRs) {
            let roomName = pR.roomName
            let db = getPrivateRoomDb(roomName)
      
            let streamDeleted = db.createReadStream('/deleted/', {
              recursive: true,
              live: true
            })
      
            let streamEdited = db.createReadStream('/edited/', {
              recursive: true,
              live: true
            })
      
            streamDeleted.on('data', n => {
              let data = n.value
              let messageId = data.messageId
              let exists = privateRoomMessages.some(x => {
                x.messageId === messageId
              })
              if (exists && messageLegit(data.messageId, data.signature, data.username)) {
                deletePrivateRoomMessage(data.messageId)
              }
            })
      
            streamEdited.on('data', n => {
              let data = n.value
              let messageId = data.messageId
              let exists = privateRoomMessages.some(x => {
                x.messageId === messageId
              })
              if (exists && messageLegit(data.messageId, data.signature, data.username)) {
                editPrivateRoomMessage(data)
              }
            })
          }
        })()
      }, [])
      
      useEffect(() => {
        (async () => {
           const pCs = privateChats
           for (const pC of pCs) {
             let user = pc.username
             let db = getPrivateChatDb(user)
             let streamDeleted = db.createReadStream('/deleted/', {
               recursive: true,
               live: true
             })
      
             let streamEdited = db.createReadStream('/edited/', {
               recursive: true,
               live: true
             })
      
             streamDeleted.on('data', n => {
               let data = n.value
               let messageId = data.messageId
               let exists = privateChatMessages.some(x => {
                 x.messageId === messageId
               })
               if (exists && messageLegit(data.messageId, data.signature, data.username)) {
                 deletePrivateChatMessage(data.messageId)
               }
             })
      
             streamEdited.on('data', n => {
               let data = n.value
               let messageId = data.messageId
               let exists = privateChatMessages.some(x => {
                 x.messageId === messageId
               })
               if (exists && messageLegit(data.messageId, data.signature, data.username)) {
                 editPrivateChatMessage(data)
               }
             })
           }
         })()
      }, [])

            /** COMMENT:
        This listens for the initiation of new chat creations or the invitation of users to private rooms, by simply listening to the streamService for new entries. Once a new stream is created, a new PCAP protocol stream is initiated with that user, over the proper discovery key.
      */
      useEffect(() => {
        (async () => {
          // live streams new PCAP initiator protocol requests
          const pcapStreams = streamService.listStreamsByType('pcap')
          for (const stream of pcapStreams) {
            const pcapInitiator = new PCAP(true, {
              encrypted: true,
              noise: true,
              onhandshake () {
                pcapInitiator.invite(1 , {
                  type: stream.type,
                  name: stream.name,
                  publicKey: stream.publicKey,
                  creator: stream.creator,
                  signature: stream.signature
                })
              },
              onaccept (channel, message) {
                let db
                if (stream.type === 'privateRoom') db = getPrivateRoomDb(stream.name)
                if (stream.type === 'privateChat') db = getPrivateChatDb(stream.name)
                else pcapInitiator.destroy()
                let query = new IdQuery(stream.intendedReceiver)
                let userKey = await query.getRemoteKey('publicKey')
                let verified = verify(stream.name, message.signature, userKey)
                if (verified) {
                  db.authorize(message.localPublicKey, () => {
                    //generate a new seed for encrypting the conversation
                    let seed = await id.passwordToSeed(id.genSalt(len = 32))
                    let encryptedSeed = AES.encrypt(seed, pin)
                    await localDb.acceptChat(stream.type, stream.name)
                    await privateDb.addEncryptionSeed(seed, stream.name)
                    pcapInitiator.authorized(1, {
                      type: stream.type,
                      seed: stream.seed,
                      name: stream.name
                    })
                  })
                }
              },
              onclose (channel, message) {
                pcapInitiator.destroy()
              }
            })
            let swarm = dswarm(dswarmOpts)
            let userDk = crypto.createHash('sha256').update(stream.intendedReceiver).digest()

            swarm.join(userDk, {
              lookup: true,
              announce: true,
            })

            swarm.on('connection', (socket, info) => {
              pump(socket, pcapInitiator, socket)
            })
          }
        })()
    }, [])

    /** COMMENT:
This does the same as the above PCAP stream initiators but instead works with the SMAP protocol. When the logged-in user requests to add a moderator, the request is packaged into an SMAP request and sent to the intended receiver. Below this, is the smapReceiver, which handles incoming SMAP requests.
*/
useEffect(() => {
  (async () => {
    // live streams new SMAP initiator protocol requests
    const smapStreams = streamService.listStreamsByType('smap')
    for (const stream of smapStreams) {
      const smapInitiator = new SMAP(true, {
        encrypted: true,
        noise: true,
        onhandshake () {
          smapInitiator.invite(1, {
            type: stream.type,
            name: stream.roomName,
            sender: stream.sender,
            signature: stream.signature,
            intendedReceiver: stream.intendedReceiver
          })
        },
        onaccept (channel, message) {
          let db
          if (stream.type === 'privateRoom') db = getManifestDb('privateManifest', stream.roomName)
          if (stream.type === 'publicRoom') db = getManifestDb('publicManifest', stream.roomName)
          else smapInitiator.destroy()
          let query = new IdQuery(stream.intendedReceiver)
          let userKey = await query.getRemoteKey('publicKey')
          let verified = verify(stream.roomName, message.signature, userKey)
          if (verified) {
            db.authorize(message.localPublicKey, () => {
              let seed = await id.passwordToSeed(id.genSalt(len = 32))
              let encryptedSeed = AES.encrypt(seed, pin)
              await localDb.acceptChat(stream.type, stream.roomName)
              await privateDb.addEncryptionSeed(seed, stream.roomName)
              smapInitiator.authorized(1, {
                roomName: stream.roomName
              })
            })
          }  else {
            smapInitiator.destroy()
          } 
        },
        onclose (channel, message) {
          smapInitiator.destroy()
        }
      })

      let swarm = dswarm()
      let userKey = `${stream.intendedReceiver}` + 'smap'

      swarm.join(userKey, {
        lookup: true,
        announce: true
      })

      swarm.on('connection', (socket, info) => {
        pump(socket, smapInitiator, socket)
      })
    }
  })()
}, [])

/**
COMMENT:
When a moderator is added (via popups/AddModerator.js), a stream config is added to the replication database (services/ReplicationDb.js), this useEffect listens for new stream configs and initiates a protocol stream for that particular configuration over a user's SMAP discovery key.
*/

useEffect(() => {
  (async () => {
    let live = streamService.listStreamsByType('smap')
    live.on('data', n => {
      let stream = n.value

      const smapInitiator = new SMAP(true, {
        encrypted: true,
        noise: true,

        onhandshake () {
          smapInitiator.invite(1, {
            type: stream.type,
            name: stream.roomName,
            sender: stream.sender,
            signature: stream.signature,
            intendedReceiver: stream.intendedReceiver
          })
        },

        onaccept (channel, message) {
          let db
          if (stream.type === 'privateRoom') db = getManifestDb('privateRoom', stream.roomName)
          if (stream.type === 'publicRoom') db = getManifestDb('publicRoom', stream.roomName)
          else smapInitiator.destroy()
          let query = new IdQuery(stream.intendedReceiver)
          let userKey = await query.getRemoteKey('publicKey')
          let verified = verify(stream.roomName, message.signature, userKey)
          if (verified) {
            db.authorize(message.localPublicKey, () => {
              let seed = await id.passwordToSeed(id.genSalt(len=32))
              let encryptedSeed = AES.encrypt(seed, pin)
              await localDb.acceptChat(stream.type, stream.name)
              await privateDb.addEncryptionSeed(seed, stream.name)
              smapInitiator.authorized(1, {
                roomName: stream.roomName
              })
            })

            // since we have achieved a successful authorization, we can remove this stream 
            await handleRemoveStream(stream)

          }  else {
            // We might be dealing with a peer who is not the target peer and masquerading as the target.
            // Since the peer in this stream isn't valid, we destroy the connection
            smapInitiator.destroy()
          }
        },

        onrefuse (channel, message) {
          let query = new IdQuery(stream.intendedReceiver)
          let userKey = query.getRemoteKey('publicKey')
          let verified = verify(stream.name, message.signature, userKey)
          if (verified) {
            smapInitiator.destroy()
            await handleRemoveStream(stream)
          }          
          // if not verified, simply do nothing.
        },
 
        onclose (channel, message) {
          // Other peer has called close, so we destroy the connection.
          smapInitiator.destroy()
        }
      })
  
      let swarm = dswarm(dswarmOpts)
      let userKey = `${stream.intendedReceiver} + 'smap'`

      swarm.join(stream.publicKey, {
        lookup: true,
        announce: true
      })

      swarm.on('connection', (socket, info) => {
        pump(socket, smapInitiator, socket)
      })
    })
  })()
}, [])

// The same as the PCAP initiator above. It listens for new PCAP stream configs via the replication database
// and initiates each with whichever peers it can connect with, over the intendedReceiver's discovery key.

useEffect(() => {
  (async () => {
    const live = streamService.listStreamsByType('pcap')
    live.on('data', n => {
      let stream = n.value
      const pcapInitiator = new PCAP(true, {
        encrypted: true,
        noise: true,
        onhandshake () {
          pcapInitiator.invite(1, {
            type: stream.type,
            name: stream.name,
            publicKey: stream.publicKey,
            creator: stream.creator,
            signature: stream.signature
          })
        },
        onaccept (channel, message) {
          let db
          if (stream.type === 'privateRoom') db = getPrivateRoomDb(stream.name)
          if (stream.type === 'privateChat') db = getPrivateChatDb(stream.name)
          else pcapInitiator.destroy()
          let query = new IdQuery(stream.intendedReceiver) 
          let userKey = await query.getRemoteKey('publicKey')
          let verified = verify(stream.roomName, message.signature, userKey)
          if (verified) {
            db.authorize(message.localPublicKey, () => {
              let seed = await id.passwordToSeed(id.genSalt(len=32))
              let encryptedSeed = AES.encrypt(seed, pin)
              await localDb.acceptChat({ type: stream.type, name: stream.name })
              await privateDb.addEncryptionSeed(seed, stream.name)
              pcapInitiator.authorized(1, {
                type: stream.type,
                seed: stream.seed,
                name: stream.name
              })

             // since we have achieved a successful authorization, we can remove this stream from the
             // replicationDb

             await handleRemoveStream(stream)
            })

          }  else {
            // If the user isn't verified, we may be communicating with a user who 
            // is masquerading under the given dWeb network address as the target peer. 
            // Connection must be destroyed.
            pcapInitiator.destroy()
          }
        },

        onrefuse (channel, message) {
          let query = new IdQuery(message.responder)
          let userKey = query.getRemoteKey('publicKey')
          // TODO: check if signature is of roomName or responder name
          let verified = verify(stream.name, message.signature, userKey)
          if (verified) {
            pcapInitiator.destroy()
            // valid user has refused the request, so remove this PCAP stream from the replicationDb
            await handleRemoveStream(stream)
          }
          // if it's not a valid refuse, simply do nothing.
        },
 
        onclose (channel, message) {
          // peer on the other end of the connection calls close, so we destroy the connection
          pcapInitiator.destroy()
        }
      })
      
      let userDk = crypto.createHash('sha256').update(stream.intendedReceiver).digest()

      let swarm = dswarm(dswarmOpts)
      swarm.join(userDk, {
        lookup: true,
        announce: true
      })

      swarm.on('connection', (socket, info) => {
        pump(socket, pcapInitiator, socket)
      })

    })
  })()
}, [])

// This useEffect listens for SMAP requests (from the initiator) and responds to those requests.

useEffect(() => {
  (async () => {
    const smapReceiver = new SMAP(false, {
      encrypted: true,
      noise: true,
      oninvite (channel, message) {
        let signature = message.signature
        let query = new IdQuery(message.sender)
        let userKey = query.getRemoteKey('publicKey')
        let verified = verify(message.roomName, signature, userKey)
        if (verified) {
          let db
          if (type === 'publicRoom') db = getManifestDb('publicRoom', message.roomName)
          if (type === 'privateRoom') db = getManifestDb('privateRoom', message.roomName)
          let secret = id.decryptSecretKey('default', pin)
          let localPublicKey = db.local.key
          let signature = sign(message.roomName, secret)
          smapReceiver.accept(1, {
            roomName: message.roomName,
            localPublicKey: localPublicKey,
            responder: currentIdentity,
            signature: signature
          })
        }  else {
         
          // if the peer we're communicating with cannot verify themselves, then they're obviously masquerading
          // as our target peer. Destroy this connection.
          smapReceiver.destroy()

        }
      },
      onauthorized (channel, message) {
        let db
        if (type === 'publicRoom') db = getManifestDb('publicRoom', message.roomName)
        if (type === 'privateRoom') db = getManifestDb('privateRoom', message.roomName)
        db.get('/moderators', (err, nodes) => {
          if (err) {
            // on error, simply send close. 
            smapReceiver.close(1, { sender: currentIdentity })
          }
          let mods = nodes[nodes.length - 1].value
          let exists = mods.some(x => x === currentIdentity)
          if (!exists) {
            mods.push(currentIdentity)
            db.put('/moderators', mods, err => {
              if (err) { 
                let secret = id.decryptSecretKey('default', pin)
                let signature = sign(message.roomName, secret)
                smapReceiver.refuse(1, {
                  responder: currentIdentity,
                  signature: signature
                })
              }
            })
          }  else {
            // If the moderator already exists within the manifest, then there is no point in this communication
            // since the currentIdentity is already a moderator. In this case, destroy this connection.
            smapReceiver.destroy()

          }
        })
        // At this point, the moderator is now authorized, and so the connection can be destroyed and 
        // the stream can be removed from the replicationDb.
        smapReceiver.destroy()
      }
    })

    let swarm = dswarm(dswarmOpts)
    let userKey = `${currentIdentity} + 'smap'`

    swarm.join(userKey, {
      lookup: true,
      announce: true
    })
    
    swarm.on('connection', (socket, info) => {
      pump(socket, smapReceiver, socket)
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