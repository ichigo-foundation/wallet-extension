import { render } from 'react-dom'
import { BrowserRouter, Routes, Route, useHistory, Navigate } from 'react-router-dom'
import React from 'react'

import Home from './routes/Home'
import Create from './routes/Create'
import SetPassword from './routes/SetPassword'
import Landing from './routes/Landing'
import Locked from './routes/Locked'
import Restore from './routes/Restore'
import Pending from './routes/Pending'
import Contacts from './routes/Contacts'
import Wallet from './routes/Wallet'
import Storage from './routes/Storage'
import Ads from './routes/Ads'
import Profile from './routes/Profile'
import Settings from './routes/Settings'

import Container from 'react-bootstrap/Container'

const App = () => {

    return (<BrowserRouter>
        <Routes>
          <Route path="/create" element={<Create />} />
          <Route path="/setpassword" element={<SetPassword />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/locked" element={<Locked />} />
          <Route path="/restore" element={<Restore />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/ads" element={<Ads />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={ <Home /> } />
        </Routes>
    </BrowserRouter>)

}

export default App
