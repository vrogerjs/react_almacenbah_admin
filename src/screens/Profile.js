import React, { useState, useEffect, createRef } from 'react';
import { useFormState, http, useResize } from 'gra-react-utils';
import { VRadioGroup } from '../utils/useToken';
import {
  Send as SendIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Accordion, AccordionDetails, AccordionSummary,
  Box, Button, Checkbox, Fab, FormControlLabel, Radio, TextField
} from '@mui/material';
import {
  useNavigate, useParams, useLocation
} from "react-router-dom";
import { useDispatch } from "react-redux";


export const Form = () => {

  const dispatch = useDispatch();

  const location = useLocation();

  const { uid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [c, setC] = useState({});

  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {
    'status': '1',
  }, {});

  const [open] = useState(true);

  useEffect(() => {
    dispatch({ type: 'title', title: 'Mi cuenta' });


    const data = {
      query: `query{
          user {
            uid,
            name
            mail,
            directoryId,
            people{
              code
              fullName
              sex
              names
              firstSurname
              lastSurname
              address
              birthdate
            }
          }}`,
    };
    http.gql('/api/admin/graphql', data).then((data) => {
      set(data.user);
    });
  }, []);

  const { width, height } = useResize(React);

  useEffect(() => {
    if (formRef.current) {
      const header = document.querySelector('.MuiToolbar-root');
      const [body, toolBar] = formRef.current.children;
      body.style.height = (height - header.offsetHeight - 0) + 'px';
      //toolBar.style.width = (width - nav.offsetWidth) + 'px';
    }
  }, [width, height]);

  const onClickAdd = () => {
    navigate('/user/create', { replace: true });
  }

  const onClickChangePassword = () => {
    console.log(o);
    http.post('/api/auth/change-password', { current: o.current, new: o.new, confirm: o.confirm }).then((e) => {
      if (e.changed) {
        set({ ...o, current: null, new: null, confirm: null });
        dispatch({ type: "snack", msg: 'Contraseña cambiada!' });
      }
    });
  }

  const onClickSave = () => {
    const form = formRef.current;
    let o2 = JSON.parse(JSON.stringify(o));
    delete o2.roles;
    if (form != null && validate(form)) {
      console.log(o2);
      http.post('/api/admin/user', o2).then((result) => {
        dispatch({ type: "snack", msg: 'Registro grabado!' });
        if (!o.uid) {
          if (result.uid)
            navigate('/user/' + result.uid + '/edit', { replace: true });
          else
            navigate(-1);
        }
      });
    } else {
      dispatch({ type: "alert", msg: 'Falta campos por completar!' });
    }
  };

  useEffect(() => {
    const form = formRef.current;
    if (form != null) {
      return bindEvents(form);
    }
  }, [o, open]);

  const onSubmit = data => console.log(data);

  const theme = createTheme({
    components: {
      // Name of the component ⚛️
      MuiInput: {
        defaultProps: {
          required: true
        }
      },
    },
  });

  function getContent() {
    return <ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>
          <Accordion expanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              Información General
            </AccordionSummary>
            <AccordionDetails >
              <TextField
                label="Nombre de usuario"
                {...defaultProps('name')}
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                label="Dirección de correo electrónico"
                {...defaultProps('mail')}
                inputProps={{ maxLength: 50 }}
              />



              <TextField
                {...defaultProps("mainPhone",{
                  required:false,
                  InputProps:{
                    
                  }})}
                label="Teléfono fijo / Celular"
              />
              <TextField
                {...defaultProps("people.code")}
                inputProps={{readOnly:true}}
                label="Número DNI/C. Extranjeria"
              />
              <TextField
                label="Nombres"
                {...defaultProps('people.names')}
                inputProps={{maxLength: 50}}
              />
              <TextField
                label="Ap. Paterno"
                {...defaultProps('people.firstSurname')}
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                label="Ap. Materno"
                {...defaultProps('people.lastSurname')}
                inputProps={{ maxLength: 50 }}
              />
              <VRadioGroup
                {...defaultProps("people.sex")}
                label="Sexo"
              >
                <FormControlLabel value="F" control={<Radio />} label="Femenino" />
                <FormControlLabel value="M" control={<Radio />} label="Masculino" />
              </VRadioGroup>
              <TextField
                multiline
                label="Dirección"
                {...defaultProps('people.address',{
                  required:false})}
                inputProps={{ maxLength: 50 }}
              />
              <div style={{ paddingTop: 10, textAlign: 'right' }}>
                <Button variant="contained" onClick={onClickSave} color="primary" endIcon={<SaveIcon />}>
                  Grabar
                </Button>
              </div>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              Cambiar contraseña
            </AccordionSummary>
            <AccordionDetails >

              <TextField
                type="password"
                label="Contraseña Actual"
                {...defaultProps('current', { required: false })}
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                type="password"
                label="Contraseña Nueva"
                {...defaultProps('new', { required: false })}
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                type="password"
                label="Confirmar Contraseña Nueva"
                {...defaultProps('confirm', { required: false })}
                inputProps={{ maxLength: 50 }}
              />
              <div style={{ paddingTop: 10, textAlign: 'right' }}>
                <Button variant="contained"
                  disabled={!o.current || !o.new || !o.confirm || o.confirm !== o.new}
                  onClick={onClickChangePassword} color="primary" endIcon={<SaveIcon />}>
                  Grabar
                </Button>
              </div>
            </AccordionDetails>
          </Accordion>
        </Box>

        {o._id && <Fab color="primary" aria-label="add"
          onClick={onClickAdd}
          style={{
            position: 'absolute',
            bottom: 80, right: 24
          }}>
          <AddIcon />
        </Fab>}
      </form>
    </ThemeProvider>
  }
  return <>{
    1 == 1 ? <Box style={{ textAlign: 'left' }}>{getContent()}</Box>
      : <Box
        sx={{ display: 'flex' }}>
      </Box>
  }
  </>;

}