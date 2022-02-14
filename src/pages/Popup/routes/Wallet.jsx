import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'

import { TX, utils, SYS }  from '../../../lib/utils.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowDown, faPlane } from '@fortawesome/free-solid-svg-icons'

import ReceiveIchigoModal from '../components/receive-ichigo-modal'

library.add(faArrowDown, faPlane)

export default function Wallet () {
  
  const [balance, setBalance] = useState(0)
  const [address, setAddress] = useState('')
  const [show, setShow] = useState(false)
  const modalShow = () => setShow(true)
  const modalClose = () => {
    setShow(false)
  }

  async function getAccountBalance(){
    let {payload:p1} = await TX.background.getAccountBalance()
    setBalance(p1.balance)
    var {payload:p2} = await TX.background.getAccountStatus()
    setAddress(utils.accountToWalletAddr(p2.address))
  }

  useEffect(()=>{
    getAccountBalance()
  }, []) 

  return (
    <section>
      <div >
        <div className="row h-wallet-head head"> 
          <div className="col-3">
            <Link to="/home" className="top-left-back-btn"> 
              <FontAwesomeIcon icon={["fas", "chevron-left"]} /> Back 
            </Link>
          </div>
          <div className="col-6 wallet-title">
            Wallet
          </div>
          <div className="col-3 text-center"></div>
        </div>
        <div className="h-wallet-body">
          <div className="text-muted text-center">Current balance</div>
          <div className="balance"> {balance} <span>ICHIGO</span></div>
          <div className="wallet-btn-ctn text-center">
            <div><Button variant="outline-secondary" onClick={modalShow}><FontAwesomeIcon icon={["fas", "arrow-down"]} /> Receive </Button></div>
            <div><Button variant="outline-secondary" href={SYS.URL.FAUCET_PAGE + '?address=' + address} target="_blank"><FontAwesomeIcon icon={["fas", "plane"]} /> Airdrop </Button></div>
          </div>
        </div>
        <div className="h-wallet-footer">
          <div className="transaction-cnt">
            <div className="empty-transaction">no transactions found</div>
          </div>
        </div>
      </div>

      {<ReceiveIchigoModal address={address} show={show} modalClose={modalClose} />}

    </section>
  )
}