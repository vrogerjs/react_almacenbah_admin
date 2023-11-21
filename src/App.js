import { useEffect } from 'react';
import HomePage from './HomePage';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  BrowserRouter as Router
} from "react-router-dom";
import './App.css';
import useToken, { Login } from './utils/useToken';
import { gapi } from 'gapi-script';
import { useSelector, useDispatch } from "react-redux";
import {
  Button, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { http } from 'gra-react-utils';
import { App as App2 } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { db } from './db';
import { useLiveQuery } from "dexie-react-hooks";

function VDialog() {

  const dialog = useSelector((state) => state.dialog);

  const options = dialog?.options ?? (dialog?.type === 'confirm' ? ['Cancelar', 'Si'] : ['Cerrar']);

  const dispatch = useDispatch();



  function onClose(e) {
    const el = e.target;
    let index;
    if (el.tagName === 'BUTTON')
      index = Array.prototype.indexOf.call(el.parentNode.children, el);
    if (dialog.cb) dialog.cb(index);
    dispatch({ type: "alert" })
  }

  return dialog ? <Dialog
    open={!!dialog}
    onClose={onClose}>
    <DialogTitle>
      {dialog.title ?? (dialog.type === 'confirm' ? 'Confirmar' : dialog.type === 'error' ? 'Error' : 'Mensaje')}
    </DialogTitle>
    <DialogContent>
      <DialogContentText style={{ lineBreak: 'anywhere' }} dangerouslySetInnerHTML={{ __html: dialog.msg }} ></DialogContentText>
    </DialogContent>
    <DialogActions style={{
      float: 'none',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      {options.map((e, i) => (<Button key={i} onClick={onClose} autoFocus={i === options.length - 1}>{e}</Button>))}
    </DialogActions>
  </Dialog> : null

}

function App() {

  const { token, setToken, logOut } = useToken();



  const dispatch = useDispatch();

  const disableds = useLiveQuery(
    () => db.disabled.toArray()
  );

  const syncronize = () => {
    if (disableds) {
      setTimeout(async () => {
        var data = disableds;
        for (var i = 0; i < data.length; i++) {
          //console.log(data[i]);
          //var result=await http.get('https://randomuser.me/api/');
          // console.log(result);
        }
      }, 1000);
    }
  }

  Network.addListener('networkStatusChange', status => {
    console.log(status);
    dispatch({ type: 'networkStatus', status: status });
    if (status.connected) {
      syncronize();
    }
  });

  Network.getStatus().then((status) => {
    dispatch({ type: 'networkStatus', status: status });
    if (status.connected) {
      syncronize();
    }
  });;

  http.onError = (request) => {
    console.log([request]);


    dispatch({ type: 'error', msg: ('<b>' + request.url + '</b><br/>' + request.error + '->' + request.message) });
  };

  useEffect(() => {
    App2.addListener('appUrlOpen', (event) => {
      dispatch({ type: 'appUrlOpen', url: event.url });
    });
    const initClient = () => {
      gapi.client.init({
        clientId: process.env.REACT_APP_PUBLIC_GOOGLE_CLIENT_ID,
        scope: ''
      });
      const accessToken = gapi.auth.getToken();
      console.log(accessToken);
    };
    gapi.load('client:auth2', initClient);
  }, [dispatch]);

  if (!token) {
    return <><Login setToken={setToken} /><VDialog /></>
  }

  const theme = createTheme({
    status: {
      danger: 'orange',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Router basename={process.env.PUBLIC_URL}>
          <HomePage logOut={logOut} />
        </Router>
        <VDialog />
      </div>
    </ThemeProvider>
  );
}

export default App;