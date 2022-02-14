import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form } from 'react-bootstrap'

import { TX } from '../../../lib/utils.js'

export default function SetPassword() {

  const [warning, setWarning] = useState('')

  const navigate = useNavigate()

  async function validate(event){
    event.preventDefault()

    let pwd = event.target.elements.password.value.trim()
    let conf = event.target.elements.confirm.value.trim()

    if(pwd.length < 8){
        setWarning('password must be at least 8 characters long')
        setTimeout(()=>setWarning(''), 2500)
        return
    }

    if(pwd != conf){
        setWarning('passwords don\'t match')
        setTimeout(()=>setWarning(''), 2500)
        return 
    }

    let result = await TX.background.createAccount(pwd)

    if(result.error == 0){
        navigate('/home')
    }

  }

  return (
    <section>
      <div className="h-psswd-head head">
        <div className="row"> 
          <div className="col-3"></div>
          <div className="col-6 text-center"> 
            Setup your password
          </div>
          <div className="col-3"></div>
        </div>
      </div>
      <div className="h-psswd-body">
        <div className="in-description" >
              Setup a local password to secure your wallet. 
              This password will be require to unlock your wallet. if you forget this password you will be able to use your seed phrase to reset it 
        </div>
      </div>
      <div className="h-psswd-links">
        <Form onSubmit={validate}>
          <div className="psswd-set-title"> Choose and confirm your password </div>
          <Form.Control type="password" name="password" placeholder="password" />
          <Form.Control type="password" name="confirm" placeholder="confirmation" />
          <div className="psswd-warning-msg">{warning}</div>
          <button className="link-block" type="submit">Create Account</button>
        </Form>
      </div>
    </section>
  );
}