import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import './lib.css';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';


ReactDOM.render(<App />, document.getElementById('root'))

if (module.hot) module.hot.accept();
