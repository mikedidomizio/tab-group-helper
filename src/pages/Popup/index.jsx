import React from 'react';
import { render } from 'react-dom';

import './index.css';
import { App } from './Popup';

render(<App />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
