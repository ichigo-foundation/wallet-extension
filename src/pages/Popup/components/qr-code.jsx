   
import React, {useRef, useEffect} from 'react';
import {Modal, Form, Button} from 'react-bootstrap'

import * as QRlib from 'easyqrcodejs'

export default function QRCode(props){
    const QRCodeDiv = useRef();

    const retrieveAddress = () => {
        new QRlib(QRCodeDiv.current, {
            // ====== Basic
            text: props.url,
            width: 140,
            height: 140,
            colorDark : "#34495e",
            colorLight : "#ffffff",
            correctLevel : QRlib.CorrectLevel.H, // L, M, Q, H
            dotScale: 0.6, // For body block, must be greater than 0, less than or equal to 1. default is 1
            logo: props.logo, // Relative address, relative to `easy.qrcode.min.js`
            PO: '#c0392b', // Global Posotion Outer color. if not set, the defaut is `colorDark`
            PI: '#c0392b', // Global Posotion Inner color. if not set, the defaut is `colorDark`
            AO: '#c0392b', // Alignment Outer. if not set, the defaut is `colorDark`
            AI: '#c0392b', // Alignment Inner. if not set, the defaut is `colorDark`
            timing: '#999999', // Global Timing color. if not set, the defaut is `colorDark`
        })
    }

    useEffect(()=>{
        retrieveAddress()
    }, []) 

    return (
        <div ref={QRCodeDiv} className="text-center"></div>
    );
}