import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

import { TX, utils } from '../../../lib/utils.js'

import Loading from './Loading'

library.add(faCheck, faTimes, faExclamationTriangle)

export default function Landing() {

  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('loading transaction...')
  const [subtitle, setSubtitle] = useState('...')
  const [cost, setCost] = useState('')
  const [canPay, setCanPay] = useState(true)

  async function getTransaction(){
    let {payload:{transaction}} = await TX.background.getCurrentTransaction()
    let {msg, keyCount, instruction} = transaction

    // bad request
    if(!instruction || !msg){
      window.close()
    }

    // if costly instruction, check the balance if enought
 
    if(msg.cost && parseFloat(msg.cost) > 0){
      let cost = parseFloat(msg.cost)
      const {payload:{balance}} = await TX.background.getAccountBalance()
      if(balance < cost){
        // not enought balance to cover cost
        setSubtitle('Flash Storage')
        setCost(cost.toFixed(2))
        let msg_str = '<i>You do not have sufficient balance in your account to execute this instruction</i><br><br>'
        msg_str += 'Your balance: '+parseFloat(balance).toFixed(2)+'<br>'
        msg_str += 'Required: '+cost.toFixed(2)+'<br>'
        setMsg(msg_str)
        setCanPay(false)
        setLoading(false)
        return
      }
    }


    if(instruction === 'store'){
      if(!msg.cost || !msg.time || !msg.size){
        window.close()
      }

      setSubtitle('Flash Storage')
      setCost(parseFloat(msg.cost).toFixed(2))
      let msg_str = '<i>storing data on the ichigo network</i><br><br>'
      msg_str += '<table><tbody>'
      msg_str += '<tr><td>data size</td><td> '+msg.size+'MB</td></tr>'
      msg_str += '<tr><td>persistency</td><td> '+msg.time+' days</td></tr>'
      msg_str += '<tr><td>key count</td><td> '+keyCount+' </td></tr>'
      msg_str += '</table></tbody>'
      setMsg(msg_str)
    }

    if(instruction === 'addContact'){
      if(!msg.name || !msg.address){
        window.close()
      }

      setSubtitle('Add Contact')
      setCost('0.00')
      let msg_str = '<i>adding contact to your account</i><br><br>'
      msg_str += '<table><tbody>'
      msg_str += '<tr><td>name</td><td> '+msg.name+'</td></tr>'
      msg_str += '<tr><td class="pending-add-contact-address">address</td><td class="break-all"> '+msg.address+'</td></tr>'
      msg_str += '</table></tbody>'  
      setMsg(msg_str)    
    }

    setLoading(false)

    // setCost(payload.transaction.cost)
    // setMsg(payload.transaction.msg)
  }

  function confirm(){
    TX.background.confirmTransaction()
  }

  function reject(){
    window.close()
  }

  useEffect(()=>{
      getTransaction()
  }, []) 


  return (

    <section>
          <div className="h-pending-body">
            <div className="">
              <div className="pending-main-title">
                <img src="icon-48.png" />
                Confirm Transaction
              </div>
              <div className="pending-main-subtitle">
                {subtitle}
              </div>
              <div className="pending-main-msg" dangerouslySetInnerHTML={{__html: msg}}>
              </div>
              <div className="pending-main-fee">
                <span className="text-muted">Network Fee</span> <br/> 
                <b>{cost}</b> <span>ICHIGO</span> <br/> 
                {/*<span className> current balance:  2025 ICHIGO</span>*/}
              </div>
            </div>
          </div>
          <div className="h-pending-links" style={{display: loading? 'none': 'block'}}>
            <div className="col text-center"> 
              {canPay && (<button to="/confirm" className="link-block green-link" onClick={confirm}> <FontAwesomeIcon icon={["fas", "check"]} /> Confirm</button>) }
              <button to="/reject" className="link-block" onClick={reject}> <FontAwesomeIcon icon={["fas", "times"]} /> Reject</button>
            </div>
          </div>
     </section>
  )
}