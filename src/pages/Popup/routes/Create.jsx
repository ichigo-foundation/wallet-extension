import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Button } from 'react-bootstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faRetweet, faCopy, faChevronLeft } from '@fortawesome/free-solid-svg-icons'

import { generateMnemonic } from 'bip39'
import { TX, utils } from '../../../lib/utils.js'

// import 'font-awesome/css/font-awesome.min.css';

library.add(faRetweet, faCopy, faChevronLeft)

export default function Create(){
  
  const [seedphrase, setSeedphrase] = useState(generateMnemonic())
  const [seedphrase_spanned, setSeedphrase_spanned] = useState('')
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  async function validate(event){
    event.preventDefault()

    if(event.target.elements.approve.checked && seedphrase.length > 24){
      let result = await TX.background.setSeedphrase(seedphrase)
      if(result.error == 0){
        navigate('/setpassword')
      }else{
        // strange error
      }
    }else{
      // need to check the box
      setError(true)
      setTimeout(()=>setError(false), 500)
    }

  }

  function copySeedphrase() {
        setCopied(true)
        setTimeout( ()=>setCopied(false), 190)
        utils.copyToClipBoard(seedphrase)
  }

  useEffect(()=>{
      setSeedphrase_spanned('<span>'+ seedphrase.split(' ').join('</span> <span>')+'</span>')
  }, [seedphrase]) 
  
  return (
    <section>
      <div >
        <div className="row h-create-head head"> 
          <div className="col-3">
            <Link to="/landing" className="top-left-back-btn"> 
              <FontAwesomeIcon icon={["fas", "chevron-left"]} /> Back 
            </Link>
          </div>
          <div className="col-6 create-title">
            Create Account
          </div>
          <div className="col-3 text-center"></div>
        </div>
        <div className="h-create-body">
          <div className="in-description">
            <span>This is your seed phrase. It will allow you to add your account on other devices and restore it if you forget your password. Keep it secret and don't forget it !</span>
          </div>
          <div className="seedphrase-title">
            <b> Your Seed Phrase </b>
            <button className="seedphrase-change-btn float-right" onClick={() => {copySeedphrase() }} >
              <FontAwesomeIcon icon={["fas", "copy"]} /> Copy
            </button>
            <div className="float-right">&nbsp;</div>
            <button className="seedphrase-change-btn float-right" onClick={() => {setSeedphrase(generateMnemonic()) }} >
              <FontAwesomeIcon icon={["fas", "retweet"]} /> Change
            </button>
          </div>
          <div className="">
            <div className={'in-passphrase '+ (copied ? 'copied':'') }  dangerouslySetInnerHTML={{__html: seedphrase_spanned}}>
            </div>
          </div>
        </div>
        <div className="h-create-links">
            <Form onSubmit={validate}>
              <Form.Check inline className={ 'seedphrase-check '+ (error ? 'warning':'') } label="I won't lose my seed phrase" name="approve" type="checkbox"/>
              <button className="link-block seedphrase-submit-btn" type="submit">Set Seedphrase</button>
            </Form>
        </div>
      </div>
    </section>
   )
}

