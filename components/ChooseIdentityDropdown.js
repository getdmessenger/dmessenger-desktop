/**
File: components/ChooseIdentityDropdown.js
Author: Jared Rice Sr. <jared@peepsx.com>
Description: Loads all identities held within dMessenger's private database and places them into a SplitButton Bootstrap dropdown menu. OnSelect, the user is forwarded to the /auth/ link for their account, so that their credentials can be verified. This menu is a component within the Start page.
*/

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dropdown } from 'react-bootstrap/Dropdown'
import { SplitButton } from 'react-bootstrap/SplitButton'
import { identitiesExist } from './../authentication/authHelpers'
import { getPrivateDb } from './../data/getPrivateDb'
import { identitiesDropdownDiv, identitiesDropdown } from './../jss/startStyles.js'

export default function ChooseIdentityDropdown () {
  const [ identities, setIdentities ] = useState([])

  let navigate = useNavigate()
  
  useEffect(() => {
    (async () => {
        let db = await getPrivateDb()
        if (identitiesExist) {
          await db.listIdentities()
                      .then(data => {
                        setIdentities(data)
                      })
        }
      }
    )()
  }, [])
  
  return (
    <div>
     {(identities.length > 0) ?
      <div id="identities-dropdown" style={identitiesDropdownDiv}>
        <SplitButton
          key="identities"
          id="dropdown-split-variants-primary"
          size="large"
          variant="primary"
          title="Choose an identity"
        >
          {identities.map((item, i) => {
              return (
              <div>
                <Dropdown.Item
                            eventKey={item.username}
                            onSelect={(e) => navigate(`/auth/${e}`)}
                           >
                          </Dropdown.Item>
                          <Dropdown.Divider />
              </div>
              )
            })
          } 
         </SplitButton>
      </div> : null}
    </div>
  )
}
