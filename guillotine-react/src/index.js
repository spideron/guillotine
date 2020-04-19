import React from 'react';
import ReactDOM from 'react-dom';
import Sockette from "sockette";
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

const ws = new Sockette('wss://guillotin-api.spideron.net', {
  timeout: 5e3,
  maxAttempts: 1,
  onopen: e => console.log('Connected!', e),
  onmessage: e => console.log('Received:', e),
  onreconnect: e => console.log('Reconnecting...', e),
  onmaximum: e => console.log('Stop Attempting!', e),
  onclose: e => console.log('Closed!', e),
  onerror: e => console.log('Error:', e)
});

ws.json({
  action: "cards-nobles-get-all",
  data: ""
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
