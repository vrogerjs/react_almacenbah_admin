import React, { useState, useEffect, createRef } from 'react';
import { useFormState, http, useResize } from 'gra-react-utils';
import { VRadioGroup } from '../../utils/useToken';
import {
  Send as SendIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Cancel as CancelIcon ,
   Search as SearchIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Accordion, AccordionDetails, InputLabel, Input, IconButton,
  Box, Button, Checkbox, Fab, FormHelperText,InputAdornment,
  FormControl, FormControlLabel, FormGroup, FormLabel, MenuItem, Radio,
  RadioGroup, Stack, TextField
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
    dispatch({ type: 'title', title: (uid ? 'Editar' : 'Agregar') + ' Usuario' });
  }, []);

  useEffect(() => {
    if (uid) {
      const data = {
        query: `query{
          user(uid:${uid} roleName:"disabled_") {
            uid,
            name
            mail,
            fullName,
            directoryId,
            names,
            firstSurname,
            lastSurname,
            status
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
            userRoles {
              pk {
                rid
              },
              role{
                name
              },
              active
            }
          }}`,
      };
      http.gql('/api/admin/graphql', data).then((data) => {
        data.user.roles = data.user.userRoles.map((e) => {
          data.user['role_' + e.pk.rid] = !!e.active;
          return { value: e.pk.rid, label: e.role.name.replace('_', ' ').split(' ').map((e) => (e.charAt(0).toUpperCase() + e.slice(1))).join(' ') };
        });
        set(data.user);
      });
    }
  }, [uid]);

  const { width, height } = useResize(React);

  useEffect(() => {
    if (formRef.current) {
      const header = document.querySelector('.MuiToolbar-root');
      const [body, toolBar] = formRef.current.children;
      const nav = document.querySelector('nav');
      body.style.height = (height - header.offsetHeight - toolBar.offsetHeight) + 'px';
      toolBar.style.width = (width - nav.offsetWidth) + 'px';
    }
  }, [width, height]);

  const cancelOnClick = () => {
    navigate(-1);
  }

  const onClickAdd = () => {
    navigate('/user/create', { replace: true });
  }

  const searchPeopleOnClick=()=>{
    http.post('/api/reniec', {code:o.people.code}, (h) => { delete h['Authorization']; return h; }).then((data) => {
      console.log(data);
    });
  }

  const onClickSave = () => {
    const form = formRef.current;
    let o2 = JSON.parse(JSON.stringify(o));
    o2.userRoles.forEach((e) => {
      e.active = !!o2['role_' + e.pk.rid];
      delete o2['role_' + e.pk.rid];
    });
    delete o2.roles;
    if (form != null && validate(form)) {
      http.post('/api/admin/user', o2, { Authorization: null }).then((result) => {
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

  function getActions() {
    return <>
      <Button variant="contained" onClick={cancelOnClick} color="primary">
        Cancelar
      </Button>
      <Button variant="contained" onClick={onClickSave} color="primary" endIcon={<SendIcon />}>
        Grabar
      </Button>
    </>
  }

  function getContent() {
    return <ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>
          <Accordion expanded={true}>
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
              <fieldset style={{
                margin: 0, borderColor: '#0000003b', borderRadius: 4.4,
                borderWidth: 1, marginTop: 20
              }}>
                <legeng>Información Personal
                  <div style={{ float: 'right' }}>

                    {o.directoryId?
                        <IconButton aria-label="edit" disabled={c.editPeople} color="primary"
                        onClick={() => { setC((o) => { return { ...o, editPeople: true } }) }} >
                        <EditIcon />
                        </IconButton>:
                        <IconButton aria-label="add" disabled={c.editPeople} color="primary"
                        onClick={() => { setC((o) => { return { ...o, editPeople: true } }) }} >
                        <AddIcon />
                        </IconButton>
                    }

                    <IconButton aria-label="cancel" disabled={!c.editPeople} color="primary"
                    onClick={() => { setC((o) => { return { ...o, editPeople: false } }) }}>
                      <CancelIcon />
                    </IconButton>
                  </div>
                </legeng>
                {
                  !c.editPeople ?
                    <TextField
                      label="Nombre Completo"
                      multiline
                      {...defaultProps('people.fullName')}
                      inputProps={{ readOnly: true }}
                    /> :
                    <>
                    <TextField
                        label="Numero Documento"
                        {...defaultProps('people.code')}
                        InputProps={{
                          maxLength: 10 ,
                          style:{textAlign:'center'},
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={searchPeopleOnClick}
                              variant="contained"
                                color="primary"
                              >
                                {<SearchIcon/>}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      <TextField
                        label="Nombres"
                        {...defaultProps('people.names')}
                        inputProps={{ maxLength: 50 }}
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
                        {...defaultProps('people.address')}
                        inputProps={{ maxLength: 50 }}
                      />
                    </>
                }
              </fieldset>
              <TextField
                type="password"
                label="Contraseña"
                {...defaultProps('pass', { required: false })}
                inputProps={{ maxLength: 50 }}
              />

              <VRadioGroup
                {...defaultProps("status")}
                label="Estado"
              >
                <FormControlLabel value="1" control={<Radio />} label="Activo" />
                <FormControlLabel value="0" control={<Radio />} label="Bloqueado" />
              </VRadioGroup>
              <TextField
                {...defaultProps("mainPhone")}
                label="Teléfono fijo / Celular"
              />
              {o.roles && o.roles.length ? <FormControl>
                <FormGroup>
                  <FormLabel>Roles</FormLabel>
                  {
                    (o.roles || []).map((e, i) => <FormControlLabel key={i} control={<Checkbox name={'role_' + (e.value)} value={e.value} checked={o['role_' + (e.value)] ?? false} onChange={handleChange} />} label={e.label} />)
                  }

                </FormGroup>
              </FormControl> : null
              }
            </AccordionDetails>
          </Accordion>


        </Box>
        <Stack direction="row" justifyContent="center"
          style={{ padding: '10px', backgroundColor: '#1976d2' }}
          alignItems="center" spacing={1}>
          {getActions()}
        </Stack>

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