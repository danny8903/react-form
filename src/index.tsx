import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { RxForm } from './RxForm';
import * as serviceWorker from './serviceWorker';

const sleep = (delay: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });

ReactDOM.render(
  <React.StrictMode>
    <RxForm
      onSubmit={async (value, meta) => {
        console.log('onSubmit', value, meta);
        await sleep(2000);
      }}
      success={(value, meta) => {
        console.log('success', { value, meta });
      }}
      failed={(value, meta) => {
        console.log('failed', { value, meta });
      }}
    >
      <div>
        form body
        <button type="submit">click to test</button>
      </div>
    </RxForm>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
