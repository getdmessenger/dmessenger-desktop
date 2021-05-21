import { DMessengerLocalDb } from '../services/LocalDb'

export default async function getLocalDb (username) {
  return new DMessengerLocalDb(username)
}