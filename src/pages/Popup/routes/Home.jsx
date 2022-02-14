import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'

import { TX, ACCOUNT_STATUS } from '../../../lib/utils.js'

import Loading from './Loading';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLock, faWallet, faAddressBook, faTools, faArchive, faCog, faUser, faBullhorn } from '@fortawesome/free-solid-svg-icons'

library.add(faLock, faWallet, faAddressBook, faTools, faArchive, faCog, faUser, faBullhorn)


export default function Home() {

    const [status, setStatus] = useState(ACCOUNT_STATUS.unknown)
    const [bal, setBal] = useState('...')
    const navigate = useNavigate()

    async function getAccountStatus(){

        let {payload} = await TX.background.getAccountStatus()

        if( payload.status == undefined || payload.status == ACCOUNT_STATUS.uninitialized ){
            navigate('/landing')
            return
        }

        if(payload.status == ACCOUNT_STATUS.locked) {
            navigate('/locked')
            return
        }


        if(payload.status == ACCOUNT_STATUS.pending) {
            navigate('/pending')
            return
        }

        // get account token amount
        let b = await getAccountBalance()
        setBal(parseFloat(b).toFixed(2).toString())

        setStatus(payload.status)
    }

    async function getAccountBalance(){
      let {payload} = await TX.background.getAccountBalance()
      return payload.balance
    }

    async function lock(){
        let {error} = await TX.background.lockAccount()

        if(error==0){
            navigate('/locked')
        }
    }

    useEffect(()=>{
        getAccountStatus()
    }, []) 
  
    if( status == ACCOUNT_STATUS.unknown)
        return (<Loading />)

    else
        return (
            <section>
                <div className="h-home-head head row">
                    <div className="col-3"></div>
                    <div className="col-6 text-center"> 
                      <img className="home-logo-icon" src="icon-42-colored.png" /> <span>Account</span>
                    </div>
                    <div className="col-3"> 
                      <button className="lock-btn" onClick={lock}> 
                          <FontAwesomeIcon icon={["fas", "lock"]} /> LOCK 
                      </button>
                    </div>
                </div>

                <div className="h-home-body">
                  <div className="home-menu">
                      <div className="home-btn-ctn">
                        <Link to='/profile' className="home-btn">
                          <FontAwesomeIcon icon={["fas", "user"]} /><br/>
                          Profile
                        </Link>
                      </div>
                      <div className="home-btn-ctn">
                        <Link to='/wallet' className="home-btn">
                          <FontAwesomeIcon icon={["fas", "wallet"]} /><br/>
                          Wallet
                        </Link>
                      </div>

                      <div className="home-btn-ctn">
                        <Link to='/contacts' className="home-btn">
                          <FontAwesomeIcon icon={["fas", "address-book"]} /><br/>
                          Contacts
                        </Link>
                      </div>
                      <div className="home-btn-ctn">
                        <Link to='/storage' className="home-btn">
                          <FontAwesomeIcon icon={["fas", "archive"]} /><br/>
                          Storage
                        </Link>
                      </div>

                      <div className="home-btn-ctn">
                        <Link to='/ads' className="home-btn">
                          <FontAwesomeIcon icon={["fas", "bullhorn"]} /><br/>
                          Ads
                        </Link>
                      </div>
                      <div className="home-btn-ctn">
                        <Link to='/settings' className="home-btn">
                          <FontAwesomeIcon icon={["fas", "cog"]} /><br/>
                          Settings
                        </Link>
                      </div>

                    </div>

                  </div>
                  
                  <div className="h-home-footer">
                      <div className="text-center"> 
                        <div className="tokenAmount"> 
                          <div > <i className="fas fa-sync"></i></div>
                          <span className="balance-amount">{bal}</span> 
                          <span className="currency-mark">ICHIGO</span>
                           
                        </div>
                      </div>
                    </div>

            </section>
        )
}