# Room Manifests and SMAP
Each public room and private room has a manifest, which is simply a separate distributed data structure (a dAppDB) that is referenced in the room's NeutronDB (the first entry) and in replicated over a discovery key that is simply a hash of (roomName + 'manifest'). This way, when looking up a room, its room key (a hash of the roomName) and its manifest can easily be discovered and replicated by anyone. Having a multi-writer manifest built around dAppDB, allows the creator of the room (the master of the manifest), to authorize others to write to the manifest and control who moderates the room. This is important with chat rooms these days, where spam is prevalent and illegal content can easily be shared. These sorts of things destroy communities and in a decentralized chat environment like the one dMessenger enables, moderation was key. This required a separate protocol we call "SMAP", which stands for "Simple Moderator Authorization Protocol" which allows the creator of a room to send protocol messages to another user over their announced discovery key (a hash that derives from their username + 'mod'), in order to authorize them as moderators. In a user's response to these protocol messages, the receiving user can (a) sign the response with their private key, proving their identity to the creator; and (b) accept the moderator invitation by sharing their local feed key from the room's manifest. Upon receiving this, the creator can then authorize them as a moderator, by authorizing their local writes to replicate with the main manifest, which is ultimately replicated to all of the room's users instantly and simultaneously. 

This is great for moderating a public or private room, since specific actions taken can be stored in the manifest under certain schemas. Since the manifest also contains default data related to the room, like a room's avatar, its display name, descriptions and policies, this means that moderators can also edit this data, since they have write access. Since a room's NeutronDB is a "multifeed" (a dDatabase that references many other dDatabases) and all of its underlying feeds are consistently replicated, a public room's manifest is just another feed referenced in the main feed and is also replicated along with all of the room's underlying feeds. When joining a room, the room's underlying replication details are stored in the localDB's swarm configs, so that they can be retrieved by the Controller on startup (see Controller.js), and the room's manifest is also stored under `manifestConfigs`, and its swarm config is also retrieves and booted up on startup. This way, on startup, all rooms and their manifests are continuously replicated. This means, each user of dMessenger should have an up-to-date view of all data associated with a room, from messages to the data associated with the room.

Below, is a full description of what a room manifest stores and the schemas associated with these types.

## Moderation
Moderators have the ability to block users, delete messages, and more. These actions are stored in the manifest and viewed by the application when building out the UI for a user. That means, each message is looked up in the manifest, to see if it is deleted, prior to being displayed within the application's actual state. This allows moderators to prevent certain messages from appearing in a room. At the same time, users who are blocked, will be unable to use a room and if the application sees that the user is blocked, the room's data will be automatically removed from their local database, along with all swarm configs related to the room's data.

### Blocking Users
When a moderator chooses to block a user, this data is stored in the manifest's underlying database, with the following schema:

##### KEY:
```
/blocked/${user}
```

##### VALUE:
```
{
  blockedBy: ${user},
  blockedTimestamp: timestamp,
  blockedUser: ${blockedUser}
}
```

### Deleting Messages
When a moderator chooses to delete a message, this data is stored in the manifest's underlying database, with the following schema:

##### KEY:
```
/deleted/${messageId}
```

##### VALUE:
```
{
  messageId: ${messageId},
  deletedBy: ${deletedBy},
  deletedTime: ${deletedTime}
}
```

dMessenger's UI when viewing a specific room, will also check to see if a message has been deleted, before rendering it to the UI. This way, deleted messages, never make it to the screens of a room's members.

## Referencing Moderators
###### KEY:
```
/moderators
```

##### VALUE:
```
  [  user1,
     user2,
     etc...
  ]
```

As the creator of the manifest authorizes new users as moderators, their usernames are added under `/moderators`. This way, dMessenger's UI can build a simple list of a room's moderators and render that list in the UI.

## Referencing Room Data
Data related to a room is also stored in the manifest, using the following schema:

###### KEY:
```
/roomData
```

###### VALUE:
```
{
  avatar: ${avatar}, // binary representation of image file
  roomDescription: ${roomDescription},
  roomPolicy: ${roomPolicy},
  roomDisplayName: ${roomDisplayName}
}
```

## SMAP (Simple Moderator Authorization Protocol)
The SMAP (Simple Moderator Authorization Protocol) protocol has four stages - `Invite`, `Accept`, `Authorized` and `Refused`, which take on the following schema/process:

#### Invite
The creator of a room, when wanting to add a new moderator, opens a new SMAP protocol stream over the intended receiver's discovery key and the word "mod" (a hash of the user's username + 'mod') (the user they want to be a moderator) and send an invite message. This contains the roomName, the type of room, the sender's username (the room creator), a signature of the roomName (signed with the sender's private key) and the username of the intended receiver. This schema can be found below.

##### INVITE SCHEMA
```
- roomName (name of room)
- type (type of room - `publicRoom` or `privateRoom`)
- sender (user sending the invite)
- signature (signature of the room name)
- intendedReceiver (user that should be receiving the invitation)
``` 

#### Accept
The receiver is always listening over their discovery key for SMAP protocol messages (hash of username + 'mod'). Upon receiving an invite message, the receiver verifies the signature by querying the DHT for the sender's public key and verifying the signature derived from that user. If so, it takes the local key from the room's manifest feed, signs the roomName with their secret key and sends the following back to the creator:

##### ACCEPT SCHEMA
```
- localPublicKey (local key of user's manifest)
- responder (responder's username)
- signature (signature of roomName)
- roomName (name of room)
```

#### Authorized
Upon receiving an `accept` response, the room's creator takes the localPublicKey and authorizes the moderator's local writes to replicate with the room's manifest. It then stores the moderator under the `/moderator` key (see above) and then sends an `authorized` message back to the receiver, using the following schema:

#### AUTHORIZED SCHEMA

```
- roomName (the roomName the receiver was authorized to write to the manifest for)
```

Upon receiving the `authorized` response, the receiver can then begin moderating the room. Since they have write access to the manifest, the UI will now show moderation options to the user, within the UI. 


#### Refused 
Whenever a receiver or the creator receives a message back, where the signature can not be verified, a refused message can be sent to the other participant in the protocol stream, and the protocol stream will be destroyed.

#### REFUSED SCHEMA
```
- responder (user sending the refused message)
- signature (signature of the word "refused")
```

#### Close
Upon successful authorization, the creator of the stream can send a close message. Upon receiving the close message, the receiver can destroy the protocol stream between both users. 

## Removing Moderators
Moderators can be easily removed as moderators, by removing their local keys as authorized writers from the underlying manifest. dAppDB has this built-in functionality, to remove authorized writers. This is easily accomplished through dMessenger's UI, using the "Remove Moderator" button.