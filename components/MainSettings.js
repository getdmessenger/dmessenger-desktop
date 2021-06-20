/**
File: components/MainSettings.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Main component within the /settings/ page, allowing users to edit their default dMessenger settings.
*/

import React, { useState, useEffect } from 'react'
import { Container, Row, Alert, Form, Button } from 'react-bootstrap'
import { useIdentity } from './../hooks'
import { getLocalDb } from './../data/getLocalDb'

export default function MainSettings ({}) {
  const [ saved, setSaved ] = useState()
  const [ currency, setCurrency ] = useState()
  const [ currencies, setCurrencies ] = useState(['USD', 'EUR', 'CNY', 'JPY'])
  const [ language, setLanguage ] = useState()
  const [ languages, setLanguages ] = useState(['EN'])
  const [ autoLogout, setAutoLogout ] = useState()
  const [ autoLogoutPeriods, setAutoLogoutPeriods ] = useState([15, 20, 25, 30, 60])

  const { currentIdentity } = useIdentity()
  const localDb = await getLocalDb(currentIdentity)
  
  useEffect(() => {
    (async () => {
      let settings = await localDb.getSettings()
      setCurrency(settings.defaultCurrency)
      setLanguage(settings.defaultLanguage)
      setAutoLogout(settings.autoLogoutTime)
    })()
  })

  const handleSubmitSettings = async () => {
    await localDb.putSettings({
      defaultCurrency: currency,
      defaultLanguage: language,
      autoLogoutTime: autoLogout
    })
    setSaved(true)
    setTimeout(setSaved(false), 10000)
  }

  return (
    <Container fluid>
      <Row className="content-justify-left">
        {(saved) ? <Alert variant="success">Settings were updated successfully!</Alert> : null }
        <h3>Choose a default currency:</h3>
        <Form.Control as="select" onChange={event => setCurrency(event.target.value)}>
          {(currency) ? <option>{currency}</option> : null }
          {currencies.filter(x => x !== currency)
                          .map(c => {
                    <option>{c}</option>
          })}
        </Form.Control>
        <h3>Choose a default language:</h3>
        <Form.Control as="select" onChange={event => setLanguage(event.target.value)}>
          {(language) ? <option>{language}</option> : null}
          {languages.filter(x => x !== language)
                          .map(l => {
                    <option>{l}</option>
          })}
        </Form.Control>
        <h3>Choose auto-logout time period:</h3>
        <Form.Control as="select" onChange={event => setAutoLogout(event.target.value)}>
          {(autoLogout) ? <option>{autoLogout}</option> : null}
          {autoLogoutPeriods.filter(x => x !== autoLogout)
                                       .map(a => {
                    <option>{a}</option>
          })}
        </Form.Control>
        <Button variant="primary" size="lg" onClick={handleSubmitSettings} block>Edit Settings</Button>
      </Row>
    </Container>
  )
}