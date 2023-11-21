import React, { useState, useEffect, createRef } from 'react';
import { useFormState, useResize, http } from 'gra-react-utils';
import { db } from '../../db';
import {
  Send as SendIcon,
  Add as AddIcon,
  Keyboard
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box, Button, Card, CardContent, Fab, MenuItem, Stack, InputAdornment, TextField, Grid, Typography
} from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import Select from '@mui/material/Select';

export const Form = () => {

  const dispatch = useDispatch();

  const networkStatus = useSelector((state) => state.networkStatus);

  const { pid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [dependencias, setDependencias] = useState([]);

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {

  }, {});

  const [d] = useFormState(useState, {

  }, {});

  let days = { 2: 'Lunes', 3: 'Martes', 4: 'Miercoles', 5: 'Jueves', 6: 'Viernes' };

  useEffect(() => {
    dispatch({ type: 'title', title: (pid ? 'Actualizar' : 'Registrar') + ' Dependencia' });
    [].forEach(async (e) => {
      e[1](await db[e[0]].toArray());
    });
  }, []);

  const pad = (num, places) => String(num).padStart(places, '0')

  useEffect(() => {
    if (pid) {
      if (networkStatus.connected) {
        http.get(process.env.REACT_APP_PATH + '/cronograma/' + pid).then((result) => {
          var target = new Date("2023-08-02T" + result.horaIni);
          result.horaIni = target;
          var target = new Date("2023-08-02T" + result.horaFin);
          result.horaFin = target;
          set(result);
        });
      }
    } else {
      try {
        var s = localStorage.getItem("setting");
        if (s) {
          s = JSON.parse(s);
          var o2 = {};
          o2.dependencia = s.dependencia;
          o2.abreviatura = s.abreviatura;
          o2.nombaperesponsable = s.nombaperesponsable;
          o2.cargoresponsable = s.cargoresponsable;
          set({ ...o, ...o2 });
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, [pid]);

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

  useEffect(() => {
    dispatch({ type: 'title', title: 'Administración de Tickets para Atención al Ciudadano - GORE Áncash' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  const fetchData = async (page) => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const resultD = await (http.get('https://web.regionancash.gob.pe/admin/directory/api/dependency/0/0'));
      setDependencias(resultD.data);
    }
  };

  const onClickCancel = () => {
    navigate(-1);
  }

  const onClickAdd = async () => {
    navigate('/dependencia/create', { replace: true });
  }

  const onChangeDependencia = (event) => {
    var dep = dependencias.find((e) => o.dependencia.id == e.id);
    o.dependencia = {
      id: dep.id,
      name: dep.fullName,
      abreviatura: dep.type.abreviatura
    };

  };

  const onClickSave = async () => {
    console.log(o);
    const form = formRef.current;
    if (0 || form != null && validate(form)) {
      //let res=await http.post(process.env.REACT_APP_PATH + '/dependencia', { id:d.idDep, idDep: d.idDep, name: d.name, abreviatura: d.abreviatura });

      onChangeDependencia();
      horaIni = o.horaIni.toDate ? o.horaIni.toDate() : o.horaIni;
      horaFin = o.horaFin.toDate ? o.horaFin.toDate() : o.horaFin;

      var horaIni = pad(horaIni.getHours(), 2) + ":" + pad(horaIni.getMinutes(), 2) + ":" + pad(horaIni.getSeconds(), 2);
      var horaFin = pad(horaFin.getHours(), 2) + ":" + pad(horaFin.getMinutes(), 2) + ":" + pad(horaFin.getSeconds(), 2);

      var o2 = { ...o, horaIni: horaIni, horaFin: horaFin, texto: days[o.dia] };

      if (networkStatus.connected) {
        http.post(process.env.REACT_APP_PATH + '/cronograma', o2).then(async (result) => {
          if (!o2._id) {
            if (result.id) {
              // navigate('/dependencia/' + result.id + '/edit', { replace: true });
              dispatch({ type: "snack", msg: 'Registro grabado!' });
              navigate('/cronograma', { replace: true });
            }
            else {
              navigate(-1);
            }
          }
        });
      } else {
        if (!o2.id) {
          o2.tmpId = 1 * new Date();
          o2.id = -o2.tmpId;
          //await db.disabled.add(o2);
          navigate('/' + o2.id + '/edit', { replace: true });
        } else {
          //await db.disabled.update(o2.id, o2);
        }
        dispatch({ type: "snack", msg: 'Registro grabado!' });
      }
    } else {
      dispatch({ type: "alert", msg: 'Falta campos por completar!' });
    }
  };

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
      <Button variant="contained" onClick={onClickCancel} color="error">
        Cancelar
      </Button>
      <Button disabled={o.old && !o.confirm} variant="contained" onClick={onClickSave} color="success" endIcon={<SendIcon />}>
        Grabar
      </Button>
    </>
  }

  function onChangehoraIni(v) {
    set(o => ({ ...o, horaIni: v }), () => {
      o.horaIni = v;
    });

  }

  function onChangehoraFin(v) {
    set(o => ({ ...o, horaFin: v }), () => {
      o.horaFin = v;
    });
  }

  function getContent() {
    return <LocalizationProvider dateAdapter={AdapterDayjs}><ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>

          <Card className='mt-1 bs-black'>

            <CardContent>
              <Typography gutterBottom variant="h5" className='text-center fw-bold color-gore'>
                DATOS DEL CRONOGRAMA
              </Typography>
              <Grid container>
                <Grid item xs={12} md={12}>
                  <Select
                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione la Dependencia: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("dependencia.id", { onChange: onChangeDependencia })}
                  >
                    {dependencias.map((item, i) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.fullName}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    className='select'
                    select

                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione el día de la Semana: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("dia")}
                  >
                    {Object.keys(days).map((key) => (
                      <MenuItem key={key} value={key}>
                        {days[key]}
                      </MenuItem>
                    ))}

                    {/* <MenuItem value={2}>Lunes</MenuItem>
                      <MenuItem value={3}>Martes</MenuItem>
                      <MenuItem value={4}>Miercoles</MenuItem>
                      <MenuItem value={5}>Jueves</MenuItem>
                      <MenuItem value={6}>Viernes</MenuItem> */}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TimePicker
                    ampm={false}
                    openTo="hours"
                    views={['hours', 'minutes', 'seconds']}
                    inputFormat="HH:mm:ss"
                    mask="__:__:__"
                    label="Hora Inicio:"
                    onChange={onChangehoraIni}
                    value={o.horaIni || ''}
                    renderInput={(params) =>
                      <TextField

                        required={false}
                        fullWidth
                        size="medium"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...params}
                      />
                    }
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TimePicker
                    ampm={false}
                    openTo="hours"
                    views={['hours', 'minutes', 'seconds']}
                    inputFormat="HH:mm:ss"
                    mask="__:__:__"
                    label="Hora Fin:"
                    onChange={onChangehoraFin}
                    value={o.horaFin || ''}
                    renderInput={(params) =>
                      <TextField

                        required={false}
                        fullWidth
                        size="medium"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...params}
                      />
                    }
                  />
                </Grid>
              </Grid>

              <Grid container>
                <Grid item xs={12} md={12}>
                  <TextField

                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Ingrese la cantidad máxima de tickets a generar: "
                    placeholder="Cantidad máxima"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("limite")}
                  />
                </Grid>
              </Grid>


            </CardContent>
          </Card>

        </Box>
        <Stack direction="row" justifyContent="center"
          style={{ padding: '10px', backgroundColor: '#0f62ac' }}
          alignItems="center" spacing={1}>
          {getActions()}
        </Stack>

        {(o._id || o.id) && <Fab color="primary" aria-label="add"
          onClick={onClickAdd}
          style={{
            position: 'absolute',
            bottom: 80, right: 24
          }}>
          <AddIcon />
        </Fab>}
      </form>
    </ThemeProvider></LocalizationProvider>
  }
  return <>{
    1 == 1 ? <Box style={{ textAlign: 'left' }}>{getContent()}</Box>
      : <Box
        sx={{ display: 'flex' }}>
      </Box>
  }
  </>;

}