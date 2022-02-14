import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import { Form } from 'react-bootstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faChevronLeft, faWrench } from '@fortawesome/free-solid-svg-icons'

library.add(faChevronLeft, faWrench)

export default function Ads () {
  const [on, setOn] = useState(false)


  return (
 <section>
      <div >
        <div className="row h-tools-head head"> 
          <div className="col-3">
            <Link to="/home" className="top-left-back-btn"> 
              <FontAwesomeIcon icon={["fas", "chevron-left"]} /> Back 
            </Link>
          </div>
          <div className="col-6 tools-title">
            Ads (IIP)
          </div>
          <div className="col-3 text-center"></div>
        </div>
        <div className={on ? "ads-body-title-on":"ads-body-title"}>   
        <Form.Check 
          type="switch"
          id="custom-switch"
          label={on ? "Ichigo Incentive Program is ON": "Turn ON Ichigo Incentive Program"}
          onChange={ () => setOn(!on)}
        /> 
        </div>
        <div className="h-tools-body maintenance-ctn">
          <div style={{textAlign:"justify"}}><i>Turn on IIP to accept ad impression and receive ICHIGO token in exchange of your precious attention. Support financial incentive injection in the community with IIP.</i></div>
          <div><FontAwesomeIcon icon={["fas", "wrench"]} style={{fontSize:"28px"}} /></div>
          <div>Under Development <br/> Not available in testnet's Sandbox </div>
        </div>
        <div className="h-tools-footer">
            
        </div>
      </div>
    </section>
  )
}