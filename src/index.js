import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { useSelector, useDispatch } from "react-redux";
import {
  Backdrop, CircularProgress
} from '@mui/material';
import { http } from 'gra-react-utils';

import { db } from './db';


if (0 || !process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  //localStorage.setItem('token', JSON.stringify({ "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tL2lzc3VlciIsInVwbiI6Impkb2VAcXVhcmt1cy5pbyIsImdyb3VwcyI6WyJVc2VyIiwiQWRtaW4iXSwidWlkIjoxLCJ1c2VyIjoiYWRtaW4iLCJiaXJ0aGRhdGUiOiIyMDAxLTA3LTEzIiwiaWF0IjoxNjc1MjcyMjEyLCJleHAiOjE2NzUyNzU4MTIsImp0aSI6IjNmZDg4ODIwLTFlZDYtNGRiZC05MGQ5LWE0NWFlZDJiYWUxNyJ9.Gu0Hz87Vlc4BFw6Y6j26YjphJjbFfgFQJjXnw7JuXYMb4HhRl4jNMXSyB-RHmqVxML3Ets2-yP6t1M7PWBE3kEuAC4RbToU4nfLfZvCdbM4thz82sP-RO28K3bWG9GVGV8-iA6GQ_jH4i3eZvePW9jKOB8g19QJLsBUCrWFGNSnYWEMz7Oxg58PJooobBdGJRSGZFLAognYcDvxvHPY1UgOC43m5HKwaSp8OmL4P_dXnpsFjg2aOXlofGVilVteN6KI2NPkoUfv13SHXHzrXfqazhW5cMt_kTSX1W3SETcQSF61e--2bA4ik2aHpB9gMzQvQ6YRqEykWZue_E5YtCw" }));
  localStorage.setItem('perms', JSON.stringify(["admin/uti/attention", "UTI_ATTENTION_REGISTER",
    "ACCESS_UTI", "admin/uti", "ACCESS_METAS", "admin/seguimientometa", "REGISTER_PMA", "ACCESS_USERS",
    "REGISTER_PMA", "ACCESS_USERS", "REGISTER_PMA", "DISABLED_REGISTER", " ADMIN_DESARROLLO_SOCIAL",
    "admin/disabled", "DESARROLLO_SOCIAL_ADMIN_DISABLED", "ACCESS_DESARROLLO_SOCIAL",
    "DESARROLLO_SOCIAL_REGISTER_DISABLED", "DESARROLLO_SOCIAL_ACCESS_DISABLED", "ADMIN_ALMACEN_BAH"]));
}

http.baseURL = process.env.REACT_APP_BASE_URL;

function counterReducer(state = { title: '', networkStatus: {}, drawer: false, url: null, load: false, snack: null, cb: null, dialog: null, result: null }, action) {

  switch (action.type) {
    case 'alert':
    case 'error':
    case 'confirm':
      return { ...state, ...{ dialog: action.msg ? action : null } }
    case 'appUrlOpen':
      return { ...state, ...{ url: action.url } }
    case 'networkStatus':
      return { ...state, ...{ networkStatus: action.status } }
    case 'snack':
      return { ...state, ...{ snack: action.msg ? action : null } }
    case 'load':
      return { ...state, ...{ load: !!action.show } }
    case 'drawer':
      return { ...state, ...{ drawer: 'drawer' in action ? !!action.drawer : !state.drawer } }
    case 'title':
      return { ...state, ...{ title: action.title } }
    default:
      if (action.fn) {
        action.fn(db);
      }
      return state
  }
}



let store = createStore(counterReducer)



const root = ReactDOM.createRoot(document.getElementById('root'));

function VBackdrop() {

  const load = useSelector((state) => state.load);

  const dispatch = useDispatch();

  http.loadingMask = (show) => {
    dispatch({ type: 'load', show: show });
  };
  return <Backdrop style={{ zIndex: 100000 }}
    open={!!load}

  >
    <CircularProgress />
  </Backdrop>;
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <VBackdrop />

    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

/*npm install @capacitor/cli @capacitor/core
npx cap init
npm i @capacitor/android
npx cap add ios
npm start
npx cap open ios*/
