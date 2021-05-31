import os from 'os'
import path from 'path'

export const TOTAL_CACHE_SIZE = 1000
export const CACHE_RATIO = null
export const TREE_CACHE_SIZE = null
export const DATA_CACHE_SIZE = null
export const DEFAULT_STORAGE_DIR = path.join(os.homedir(), 'dmessenger', 'storage')
export const MAX_PEERS = Infinity
export const SWARM_PORT = 6620
export const HOME_DIRECTORY = os.homedir()
export const MAIN_DIRECTORY = path.join(HOME_DIRECTORY, "dmessenger")
export const BASE_LOCATION = path.join(MAIN_DIRECTORY, "data")
export const ID_DIR = path.join(HOME_DIRECTORY, "identities")
export const APP_NAME = "dMessenger"
export const ID_PREFIX = "!identities!"
export const ROOM_PREFIX = "!network!room!"
export const LOCAL_PREFIX = "!network!local!"
export const NOTIFICATIONS_ICON = "./assets/icon/notifications.png"
export const PRIVATE_CHAT_DIR = path.join(BASE_LOCATION, "privateChats")
export const PRIVATE_ROOMS_DIR = path.join(BASE_LOCATION, "privateRooms")
export const PUBLIC_MANIFEST_DIR = path.join(BASE_LOCATION, "publicManifests")