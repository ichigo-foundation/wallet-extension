import React from 'react';
import { Accordion} from 'react-bootstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

library.add(faTrash)

export default function Contact(props){
    return (
      <Accordion.Item className="contact-item" eventKey={props.eventKey}>
        <Accordion.Header>{props.contactName}</Accordion.Header>
        <Accordion.Body className="contact-item-address">
          <div>{props.contactAddress}</div>
          <div className="text-right">
            <button className="detail-btn" onClick={()=>props.remove(props.contactAddress)}><FontAwesomeIcon icon={["fas", "trash"]} /></button>
          </div>
        </Accordion.Body>
      </Accordion.Item>
    );
}