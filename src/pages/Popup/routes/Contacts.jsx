import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { Form, FormControl, Button, InputGroup, Accordion, Modal} from 'react-bootstrap'

import Contact from '../components/contact'
import ContactModal from '../components/contact-modal'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faChevronLeft, faSearch, faPlus } from '@fortawesome/free-solid-svg-icons'

import { TX } from '../../../lib/utils.js'

library.add(faChevronLeft, faSearch, faPlus)

export default function Contacts () {

  const [show, setShow] = useState(false)
  const modalShow = () => setShow(true)
  const modalClose = () => {
    getContacts()
    setShow(false)
  }

  const [contacts, setContacts] = useState([])

  async function getContacts(){
    let {error, payload} = await TX.background.getContacts()
    if(error == 0){
        let tmp = Object.keys(payload.contacts).map( k => [payload.contacts[k].name, payload.contacts[k].address])
        console.log(tmp.sort())
        setContacts(tmp)
    }
    else{
        setContacts([])
    }
  }

  async function removeContact(addr){
      await TX.background.removeContact(addr)
      getContacts()
  }

    useEffect(()=>{
        getContacts()
    }, []) 


  return (
    <section>
      <div >
        <div className="row h-contacts-head head"> 
          <div className="col-3">
            <Link to="/home" className="top-left-back-btn"> 
              <FontAwesomeIcon icon={["fas", "chevron-left"]} /> Back 
            </Link>
          </div>
          <div className="col-6 contacts-title">
            Contacts
          </div>
          <div className="col-3 text-center"></div>
        </div>
        <div className="h-contacts-body">
            <div className="contact-search-ctn">
              <InputGroup className="mb-3">
                <FormControl placeholder="Search" />
                {/*<Button variant="outline-secondary">
                  <FontAwesomeIcon icon={["fas", "search"]} />
                </Button>*/}
                </InputGroup>
            </div>
            <div className="contact-list-ctn">
                { (contacts.length == 0) && <div className="empty-contact"> your contact list is empty </div> }
                <Accordion flush>
                    { contacts.map( (c, i)  => 
                        <Contact key={i} eventKey={i} contactName={c[0]} contactAddress={c[1]} remove={removeContact} /> 
                    )}
                </Accordion>
            </div>
        </div>
        <div className="h-contacts-footer">
            <button className="link-block add-contact-btn" onClick={modalShow}> <FontAwesomeIcon icon={["fas", "plus"]} /> Add Contact </button>
        </div>
      </div>

      <ContactModal show={show} modalClose={modalClose} />

    </section>
  )
}

