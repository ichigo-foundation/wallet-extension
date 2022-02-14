import React from 'react'
import { Link } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faChevronLeft, faWrench } from '@fortawesome/free-solid-svg-icons'

library.add(faChevronLeft, faWrench)

export default function Storage () {
  return (
 <section>
      <div >
        <div className="row h-storage-head head"> 
          <div className="col-3">
            <Link to="/home" className="top-left-back-btn"> 
              <FontAwesomeIcon icon={["fas", "chevron-left"]} /> Back 
            </Link>
          </div>
          <div className="col-6 storage-title">
            Storage
          </div>
          <div className="col-3 text-center"></div>
        </div>
        <div className="h-storage-body maintenance-ctn">
          <div className="storage-contract-cnt">
            <div className="empty-contract">you do not have any flash storage agreement in progress</div>
          </div>
        </div>
        <div className="h-storage-footer">
            
        </div>
      </div>
    </section>
  )
}