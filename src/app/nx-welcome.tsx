import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './app';

export function NxWelcome() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

export default NxWelcome;
