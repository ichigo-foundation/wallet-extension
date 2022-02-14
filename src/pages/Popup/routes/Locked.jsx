import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap'

import { TX, ACCOUNT_STATUS } from '../../../lib/utils.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLock } from '@fortawesome/free-solid-svg-icons'

library.add(faLock)

export default function Locked() {

    const [password, setPassword] = useState('')
    const navigate = useNavigate()


    async function unlock(){
        console.log('unlocking with : ', password)

        let {payload} = await TX.background.unlockAccount(password)

        if(payload.status == ACCOUNT_STATUS.unlocked ){
            navigate('/home')
        }else{
          console.log(' wrong password')
        }
    }

  return (
    <section>
          <div className="h-lock-head head row"> 
            <div className="col-2">
              <FontAwesomeIcon icon={["fas", "lock"]} />
            </div>
            <div className="col-8 text-center"> 
               account is locked
            </div>
            <div className="col-2 text-center"> 
              
            </div>
          </div>

          <div className="h-lock-body">
            <div className=" text-center">
              <img className="mainLogo" src="icon-128.png" />
            </div>
          </div>
          <div className="h-lock-footer">
              <div className="set-lock-title"> Enter your password</div>
                
              <Form.Control type="password" name="confirm" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
              <button className="link-block" onClick={unlock}>Unlock</button>
              <div className="lock-forgot-ctn">               
                Forgot your password ?<br/>
                <Link to="/restore"> Restore account with passphrase </Link> 
              </div>
          </div>
    </section>
  );
}