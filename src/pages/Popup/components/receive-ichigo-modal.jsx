import React, {useState, useEffect} from 'react';
import {Modal, Form, Button} from 'react-bootstrap'

import { TX, utils } from '../../../lib/utils.js'

import QRCode from './qr-code'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {  faCopy } from '@fortawesome/free-solid-svg-icons'

library.add( faCopy)


export default function ReceiveIchigoModal(props){

    // const [address, setAddress] = useState('')
    const [copied, setCopied] = useState('')


    // async function retrieveAddress() {
    //     // var {error, payload} = await TX.background.getAccountStatus()
    //     if(error == 0){
    //         setAddress(utils.accountToWalletAddr(payload.address))
    //     }
    // }

    function copyAddress() {
      setCopied(true)
      setTimeout( ()=>setCopied(false), 190)
      utils.copyToClipBoard(props.address)
    }

    // useEffect(()=>{
    //     retrieveAddress()
    // }, []) 

    return (
        <Modal className="receive-ichigo-modal" show={props.show} onHide={props.modalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Receive Ichigo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="receive-qrcode-ctn">
                    <QRCode logo="icon-coin-48.png" url={props.address} />
                </div>
                <div className={'receive-address-ctn '+ (copied ? 'wallet-addr-copied':'') }>
                   {props.address}
                </div>
                <div className="text-center wallet-copy-addr-btn ">
                  <button className="link-block" onClick={copyAddress}>
                    <FontAwesomeIcon icon={["fas", "copy"]} /> copy
                  </button>
                </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={props.modalClose}>
                Close
              </Button>
            </Modal.Footer>
        </Modal>
    );
}