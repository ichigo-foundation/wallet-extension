import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'


import { TX } from '../../../lib/utils.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faChevronLeft, faWrench, faSync } from '@fortawesome/free-solid-svg-icons'

library.add(faChevronLeft, faWrench, faSync)

export default function Settings () {
  const env = 'DEV'

  const [config, setConfig] = useState({})
  const [version, setVersion] = useState('')
  const [loaded, setLoaded] = useState(false)

  async function getConfig(force = false){
    setLoaded(false)
    let {payload:{config:ic}} = await TX.background.getConfig(force)
    setVersion(Object.keys(ic)[0])
    setConfig(ic)
    setLoaded(true)
  }

  useEffect(getConfig, []) 

  return (
 <section>
      <div >
        <div className="row h-settings-head head"> 
          <div className="col-3">
            <Link to="/home" className="top-left-back-btn"> 
              <FontAwesomeIcon icon={["fas", "chevron-left"]} /> Back 
            </Link>
          </div>
          <div className="col-6 general-title">
            Settings
          </div>
          <div className="col-3 text-center"></div>
        </div>
        <div className="h-settings-body">
          <div className="settings-version">
            Version {version}
          </div>
          <div className="settings-node">
            <div className="settings-list-title"> ichigo nodes </div>
            <div className="settings-list-div">
              {loaded && config[version][env].NODE.map( (n,i) => <div key={i} className="settings-list-item"> {n.url} </div>)}
            </div>
          </div>
          <div className="settings-gateway">
            <div className="settings-list-title"> ipfs gateways </div>
            <div className="settings-list-div">
              {loaded && config[version][env].GATEWAY.map( (n,i) => <div key={i} className="settings-list-item"> {n.name} </div>)}
            </div>
          </div>
        </div>
{/*        <div className="h-tools-body maintenance-ctn">
          <div><FontAwesomeIcon icon={["fas", "wrench"]} /></div>
          <div>Under Development</div>
        </div>*/}
        <div className="h-settings-footer text-center">
            <br/>
            <Button variant="light" onClick={()=>getConfig(true)}>
              <FontAwesomeIcon icon={["fas", "sync"]} /> Refresh
            </Button>
        </div>
      </div>
    </section>
  )
}