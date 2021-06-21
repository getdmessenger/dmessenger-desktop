/**
File: components/ReactionBar.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: 
*/

import React, { useState, useEffect } from 'react'
import { Button, Badge, Modal } from 'react-bootstrap'
import { FAReply, FAThumbsUp, FAThumbsDown, FAMoney } from 'react-icons/fa'
import memdb from 'memdb'
import list from '@neutrondb/view-list'
import { getDb,
             getPrivateRoomDb } from './../data'
import { isMessageLegit } from './../roomHelpers'
import { likeMessage,
             unlikeMessage,  
             isMessageLiked } from './../helpers/reactionHelpers'
import { useMessenger, useIdentity } from './../hooks'
import { UpvotePopup } from './../popups/UpvotePopup'

export default function ReactionBar ({ id, from, name, type }) {
  const [showPopup, setShowPopup] = useState(false)
  const [isLiked, setLiked] = useState()
  const [likeCount, setLikeCount] = useState()
  const [replyCount, setReplyCount] = useState()
  const [upvoteTotal, setUpvoteTotal] = useState()
  const [likesChanged, pushLikesChange] = useState(0)
  const [repliesChanged, pushRepliesChange] = useState(0)
  const [upvotesChanged, pushUpvoteChange] = useState(0)
  const [totalBitcoin, setTotalBitcoin] = useState(0.000000000)
  const [totalEthereum, setTotalEthereum] = useState(0.000000000)
  const [totalRix, setTotalRix] = useState(0.0000)
  const [totalEos, setTotalEos] = useState(0.0000)
  const [totalBts, setTotalBts] = useState(0.0000)
  const [totalDoge, setTotalDoge] = useState(0.0000)
  const [ bitcoinValue, setBitcoinValue ] = useState()
  const [ ethereumValue, setEthereumValue ] = useState()
  const [ rixValue, setRixValue ] = useState()
  const [ eosValue, setEosValue ] = useState()
  const [ btsValue, setBtsValue ] = useState()
  const [ dogeValue, setDogeValue ] = useState()
  
  const { currentIdentity, pin, config } = useIdentity()
  const { replyingTo, setReplyingTo } = useMessenger()
  
  const handleUpvote = () => setShowPopup(true)

  const handleLike = () => { 
     // if post is already liked, we are deliking
    if (isLiked) {
      await unlikeMessage(name, type, {
        messageId: id,
        user: currentIdentity,
        pin: pin
      })
      setLiked(false)
    } else {
     await likeMessage(name, type, {
       messageId: id,
       user: currentIdentity,
       pin: pin
     })
     setLiked(true)
   }
  }

  const handleReply = () => {
    setReplyingTo({
      user: from,
      messageId: id
    })
  }
  
  // check to see if user has already liked this message at first render
  useEffect(() => {
    (async () => {
      let liked = isMessageLiked(name, type, id, currentIdentity)
      setLiked(liked)
    })()
  }, [])

  // Calculate likes total and re-calculate when there are changes to the likes data for this messageId
  useEffect(() => {
    (async () => {
      if (type === 'privateRoom') {
        let likes
        db.list(`/likes/${id}`, { recursive: true }, (err, list) => {
          if (err) return
          likes = list.length -1
          setLikeCount(likes)
        })
      } 
      else if (type === 'publicRoom') {
        let base = await getDb(name)
        let likeDb = memdb()
        let unlikeDb = memdb()
        let likeIdx = list(likeDb, (msg, next) => {
          if (!msg.value.type === "like"
               && !isMessageLegit(msg.value.messageId, msg.value.signature, msg.value.user) 
               && !msg.value.messageId === id) return next()
          next(null, [msg.value.timestamp])
        })
        let unlikeIdx = list(unlikeDb, (msg, next) => {
          if (!msg.value.type === "unlike" 
               && !isMessageLegit(msg.value.messageId, msg.value.signature, msg.value.user) 
               && !msg.value.messageId === id) return next()
          next(null, [msg.value.timestamp])
        })
        base.use('likes', likeIdx)
        base.use('unlikes', unlikeIdx)
        let likes
        let unlikes
        base.api.likes.read((err, values) => {
          likes = values.length
        })
        base.api.unlikes.read((err, values) => {
          unlikes = values.length
        })
        let cleanedLikes = likes.reducer((x, y) => x.user !== y.user)
        let cleanedUnlikes = unlikes.reducer((x, y) => x.user !== y.user)
        setLikes(cleanedLikes - cleanedUnlikes)        
      }
    })()
  }, [likesChanged])

  // Calculate replies total and re-calculate when there are changes to reply data for this messageID
  useEffect(() => {
    (async () => {
      if (type === 'privateRoom') {
        let replies
        db.list(`/replies/${id}`, { recursive: true }, (err, list) => {
          if (err) return
          replies = list.length - 1
          setReplyCount(replies)
        })
      }
      else if (type === 'publicRoom') {
        let base = await getDb(name)
        let replyDb = memdb()
        let delDb = memdb()
        let replyIdx = list(replyDb, (msg, next) => {
          if (!msg.value.type === "chat-message"
               && !isMessageLegit(msg.value.messageId, msg.value.signature, msg.value.user)
               && !msg.value.isReplyTo.messageId === id ) {
             return next()
          }
          next(null, [msg.value.timestamp])
        })
        let delIdx = list(delDeb, (msg, next) => {
          if (!msg.value.type === 'deleted-message' 
               && !isMessageLegit(msg.value.messageId, msg.value.signature, msg.value.user) 
               && !msg.value.isReplyTo.messageId === id) {
            return next()
          }
          next(null, [msg.value.timestamp])
        })
        base.use('replies', replyIdx)
        base.use('deplies', delIdx)
        let replies
        let deplies
        base.api.replies.read((err, values) => {
          replies = values.length
        })
        base.api.deplies.read((err, values) => {
          deplies = values.length
        })
        
        let cleanedReplies = replies.reducer((x, y) => x.username !== y.username)
        let cleanedDeplies = deplies.reducer((x, y) => x.username !== y.username)
        setReplyCount(cleanedReplies - cleanedDeplies)
      }
    })()
  }, [repliesChanged])

  // Watch for changes to the likes count.
  useEffect(() => {
    (async () => {
      if (type === 'privateRoom') {
        db.watch(`/likes/${id}`, () => {
          pushLikesChange(likesChanged + 1)
        })
      }
      else if (type === 'publicRoom') {
        let base = await getDb(name)
        let likeDb = memdb()
        let unlikeDb = memdb()
        let likeIdx = list(likeDb, (msg, next) => {
          if (!msg.value.type === "like" && !msg.value.messageId === id) return next()
          next(null, [msg.value.timestamp])
        })
        let unlikeIdx = list(unlikeDb, (msg, next) => {
          if (!msg.value.type === "unlike" && !msg.value.messageId === id) return next()
          next(null, [msg.value.timestamp])
        })
        base.use('likes', likeIdx)
        base.use('unlikes', unlikeIdx)
        base.api.likes.onInsert(msg => {
          pushLikesChange(likesChanged + 1)
        })
        base.api.unlikes.onInsert(msg => {
          pushLikesChange(likesChanged - 1)
        })
      }
    })()
  }, [])

  // Watch for changes to the reply count
  useEffect(() => {
    (async () => {
      if (type === 'privateRoom') {
        db.watch(`/replies/${id}`, () => {
          pushRepliesChange(repliesChanged + 1)
        })
      }
      else if (type === 'publicRoom') {
        let base = await getDb(name)
        let replyDb = memdb()
        let delDb = memdb()
        let replyIdx = list(replyDb, (msg, next) => {
          if (!msg.value.type === "chat-message" &&
               !msg.value.isReplyTo.messageId === id &&
               !msg.value.isReply) {
            return next()
          }
          next(null, [msg.value.timestamp])
        })
        let delIdx = list(delDb, (msg, next) => {
          if (!msg.value.type === "deleted-message" &&
               !msg.value.isReplyTo.messageId === id) {
            return next()
          }
          next(null, [msg.value.timestamp])
        })
        base.use('replies', replyIdx)
        base.use('deplies', delIdx)
        base.api.replies.onInsert((msg) => {
          pushRepliesChange(repliesChanged + 1)
        })
        base.api.deplies.onInsert((msg) => {
          pushRepliesChange(repliesChanged - 1)
        })
      }
    })()
  }, [])

  // Calculate upvote totals on a global and per-currency basis, for this messageId.
  useEffect(() => {
    (async () => {
      let base = await getDb(name)
      let currencies = ['Bitcoin', 'Ethereum', 'EOS', 'Dogecoin', 'BitShares', 'ARISEN']
      currencies.forEach(c => {
        if (type === 'publicRoom') {
          let upvoteDb = memdb()
          let upvoteIdx = list(upvoteDb, (upvote, next) => {
            if (!upvote.value.type === 'upvote' && !upvote.value.currency === c) return next()
            next(null, [upvote.value.timestamp])
          })
          base.use('upvotes', upvoteIdx)
          base.api.upvotes.read((err, values) => {
            values.forEach(u => {
              if (c === 'Bitcoin') setTotalBitcoin(totalBitcoin + u.total)
              if (c === 'Ethereum') setTotalEthereum(totalEthereum + u.total)
              if (c === 'ARISEN') setTotalRix(totalRix + u.total)
              if (c === 'EOS') setTotalEos(totalEos + u.total)
              if (c === 'BitShares') setTotalBts(totalBts + u.total)
              if (c === 'Dogecoin') setTotalDoge(totalDoge + u.total)
            })
          })
        }  else if (type === 'privateRoom') {
          let db = await getPrivateRoomDb(name)
          db.list(`/upvotes/${id}`, { recursive: true }, (err, list) => {
            if (err) return
            list.filter(f => f.value.currency === c)
                 .forEach(u => {
              if (c === 'Bitcoin') setTotalBitcoin(totalBitcoin + u.value.total)
              if (c === 'Ethereum') setTotalEthereum(totalEthereum + u.value.total)
              if (c === 'ARISEN') setTotalRix(totalRix + u.total.value)
              if (c === 'EOS') setTotalEos(totalEos + u.total.value)
              if (c === 'BitShares') setTotalBts(totalBts + u.total.value)
              if (c === 'Dogecoin') setTotalDoge(totalDoge + u.total.value)
            })
          })
        }
        let price = await getSpecificPrice(c, config.defaultCurrency)
        if (c === 'Bitcoin') setBitcoinValue(totalBitcoin * price)
        if (c === 'Ethereum') setEthereumValue(totalEthereum * price)
        if (c === 'ARISEN') setRixValue(totalRix * price)
        if (c === 'EOS') setEosValue(totalEos * price)
        if (c === 'BitShares') setBtsValue(totalBts * price)
        if (c === 'Dogecoin') setDogeValue(totalDoge * price)
      })
      setUpvoteTotal(
        bitcoinValue + ethereumValue + rixValue + eosValue + btsValue + dogeValue
      )
    })()
  }, [upvotesChanged])

  // notify UI that new upvote data exists for this messageId
  useEffect(() => {
    (async () => {
      let base = await getDb(name)
      let upvoteDb = memdb()
      let upvoteIdx = list(upvoteDb, (upvote, next) => {
        if (!upvote.value.type === 'upvote') return next()
        next(null, [upvote.value.timestamp])
      })
      base.use('upvotes', upvoteIdx)
      base.api.upvotes.onInsert((upvote) => {
        pushUpvoteChange(upvotesChanged + 1)
      })
    })()
  }, [])
  
  if (type === 'publicRoom' || type === 'privateRoom') {
    return (
        <>
      <UpvotePopup show={showPopup} onClose={() => setShowPopup(false)} />
      <Button
        variant = {(isLiked) ? "primary" : "outline-primary"}
        onClick={handleLike}
        size="sm"
      >
      {(!isLiked)
         ? <FAThumbsUp > Like</FAThumbsUp>
         : <FAThumbsDown > Unlike </FAThumbsDown>
      } <Badge variant="primary">{likeCount}</Badge>
      </Button>{' '}
      <Button
        variant = {(isRepliedTo) ? "secondary" : "outline-secondary"}
        onClick={handleReply}
        size="sm"
      >
        <FAReply /> Reply <Badge variant="secondary">{replyCount}</Badge>
      </Button>
      <Button
        variant = {(isUpvoted) ? "success" : "outline-success"}
        onClick={handleUpvote}
        size="sm"
      >
        <FAMoney /> Upvote <Badge variant="success">{upvoteTotal}</Badge>
      </Button>
      </>
    )
  }  else {
    return null
  }
}