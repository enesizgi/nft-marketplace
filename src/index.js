import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './frontend/components/App';
import store from './frontend/store';

const rootElement = document.getElementById('root');
render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
);
