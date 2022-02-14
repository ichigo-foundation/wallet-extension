import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLink } from '@fortawesome/free-solid-svg-icons'

library.add(faLink);

export default function Landing() {
  return (
    <section>
          <div className="h-landing-head head">
            <span className="float-left">
              <span className="pink-text">ichigo</span> network
            </span>
            <div className="top-right-link"> 
              <a href="https://ichigo.network/" target="_blank"> <FontAwesomeIcon icon={["fas", "link"]} />ichigo.network</a>
            </div>
          </div>
          <div className="h-landing-body">
            <div className="">
              <div className=" text-center">
                <img className="mainLogo" src="icon-128.png" />
              </div>
              <div className="landing-title">
                ichigo account 
              </div>
              <div className="text-muted landing-subtitle">
                Create and manage your identity on the ichigo network
              </div>
            </div>
          </div>
          <div className="h-landing-links">
            <div className=" text-center"> 
              <Link to="/create" className="link-block">New Account</Link>
              <Link to="/restore" className="link-block">Restore Account</Link>
            </div>
          </div>
    </section>
  )
}