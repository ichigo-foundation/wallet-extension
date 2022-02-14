import React, {useState} from 'react';
import {Modal, Form, Button} from 'react-bootstrap'

import { TX } from '../../../lib/utils.js'

export default function ContactModal(props){

  const [modalWarning, setModalWarning] = useState('')

  const saveContact = async (event) => {
    event.preventDefault()
    let name = event.target.elements.name.value.trim()
    let address = event.target.elements.address.value.trim()
    
    setTimeout(()=> setModalWarning(''), 2500)
    
    if(!name || name.length == 0){
        setModalWarning('Enter a name for your new contact')
        return
    }

    console.log(address, address.length)

    if(!address || (address.length < 83 || address.length > 100) ){
        setModalWarning('The address is not valid')
        return
    }

    // do the adding procedure
    let result = await TX.background.addContact(name, address)

    props.modalClose()
  }

  return (
      <Modal className="add-contact-modal" show={props.show} onHide={props.modalClose}>
        <Form onSubmit={saveContact}>
            <Modal.Header closeButton>
              <Modal.Title>Add Contact</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Contact Name</Form.Label>
                    <Form.Control type="text" name="name" placeholder="Name" />
                    <Form.Text className="text-muted">
                        Choose a name for your new contact
                    </Form.Text>
                  </Form.Group>
                  <br/>
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Contact Address</Form.Label>
                    <Form.Control as="textarea" name="address" placeholder="Address" />
                    <Form.Text className="text-muted">
                        Enter the ichigo address of your new contact
                    </Form.Text>
                  </Form.Group>
                <div className="add-contact-warning-ctn">
                    {modalWarning}
                </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={props.modalClose}>
                Close
              </Button>
              <Button type='submit' variant="success">
                Save
              </Button>
            </Modal.Footer>
        </Form>
      </Modal>
    );
}