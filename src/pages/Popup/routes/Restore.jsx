import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Button } from 'react-bootstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faRetweet, faCopy, faChevronLeft } from '@fortawesome/free-solid-svg-icons'

import { TX } from '../../../lib/utils.js'

library.add(faChevronLeft)

export default function Restore() {

  const [warning, setWarning] = useState('')
  const navigate = useNavigate()

  async function validate(event){
    event.preventDefault()
    const seedphrase = event.target.elements.seedphrase.value.trim().split(' ')

    if(seedphrase.length===0||seedphrase.length%12!==0 || seedphrase.filter(s => s.length > 2).length%12!==0){
      setWarning('Enter a correct seedphrase')
      setTimeout(()=>setWarning(''), 2500)
      return
    }
    
    let {error} = await TX.background.setSeedphrase(seedphrase.join(' '))

    if(error === 0){
      navigate('/setpassword')
    } else {
      // should not come here
      return
    }
  }

  return (
    <section>
        <div className="row h-restore-head head"> 
          <div className="col-3">
            <Link to="/landing" className="top-left-back-btn"> 
              <FontAwesomeIcon icon={["fas", "chevron-left"]} /> Back 
            </Link>
          </div>
          <div className="col-6 create-title text-center">
            Restore Account
          </div>
          <div className="col-3"> </div>
        </div>
        <div className="h-restore-body">
            <Form onSubmit={validate}>
              <div> 
                <div className="restore-set-title" >Enter your seed phrase</div>
                <textarea name="seedphrase" rows="8" name="seedphrase"></textarea>
              </div>
              <div className="restore-warning-msg">{warning}</div>
              <div style={{marginTop:'50px'}}> 
                <button className="link-block" type="submit">Restore Account</button>
              </div>
            </Form>
        </div>
    </section>
  );
}

