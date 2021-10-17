import { App } from './Popup';
import './index.css';
import React from 'react';
import { render } from 'react-dom';

render(<App />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
