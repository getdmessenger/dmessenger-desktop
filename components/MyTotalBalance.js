/**
File: components/MyTotalBalance.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: This component displays the logged-in user's total wallet balance, using the default currency chosen within the user's settings (USD, CNY, EUR, etc.), within the SidebarHeader on each page. 
*/

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom' 
import { useIdentity, useMessenger } from './../hooks'
import { getTotalBalance } from './../helpers/walletHelpers'

export default function MyTotalBalance ({}) {
  const [ totalBalance, setTotalBalance ] = useState()
  const { settings } = useMessenger()
  const { currentIdentity } = useIdentity()

  useEffect(() => {
    (async () => {
      let prefCurrency = settings.defaultCurrency
      let tBalance = await getTotalBalance(currentIdentity, prefCurrency)
      setTotalBalance(tBalance)
    })()
  })

  return (
    <Link to="/wallet">
      <p style={{fontSize:'10px'}}>{totalBalance}</p>
    </Link>
  )
}