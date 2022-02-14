import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'

import { TX, utils }  from '../../../lib/utils.js'

import QRCode from '../components/qr-code'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faChevronLeft, faWrench, faCopy } from '@fortawesome/free-solid-svg-icons'

library.add(faChevronLeft, faWrench, faCopy)

export default function Profile (props) {

    const [address, setAddress] = useState('')
    const [copied, setCopied] = useState('')

    async function retrieveAddress() {
        var {error, payload} = await TX.background.getAccountStatus()

        if(error == 0){
            setAddress(payload.address)
        }
    }

    function copyAddress() {
      setCopied(true)
      setTimeout( ()=>setCopied(false), 190)
      utils.copyToClipBoard(address)
    }

    useEffect(()=>{
        retrieveAddress()
    }, []) 

  return (
    <section>
      <div >
        <div className="row h-profile-head head"> 
          <div className="col-3">
            <Link to="/home" className="top-left-back-btn"> 
              <FontAwesomeIcon icon={["fas", "chevron-left"]} /> Back 
            </Link>
          </div>
          <div className="col-6 general-title">
            Profile
          </div>
          <div className="col-3 text-center"></div>
        </div>
        <div className="h-profile-body">
          <div className="profile-main-ctn">
{/*            <div className="receive-qrcode-ctn">
              <QRCode logo="icon-48.png" url={address} />
            </div>*/}
            <div className="profile-address-title"> your ichigo address </div>
            <div className={'profile-address-ctn '+ (copied ? 'profile-addr-copied':'') }>
              {address}
            </div>
            <div className="text-center">
              <button className="link-block" onClick={copyAddress}>
                <FontAwesomeIcon icon={["fas", "copy"]} /> copy
              </button>
            </div>
          </div>
        </div>
        <div className="h-profile-footer">
          <div className="profile-params-ctn">
            <div className="text-muted"> Edit your profile</div> <br/><br/><br/>
            <div><FontAwesomeIcon icon={["fas", "wrench"]} /></div><br/>
            <div>Under Developmnent</div>
          </div>
        </div>
      </div>
    </section>
  )
}