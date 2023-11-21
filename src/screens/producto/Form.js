import React, { useState, useEffect, createRef } from 'react';
import { useFormState, useResize, http } from 'gra-react-utils';
import { db } from '../../db';
import { Send as SendIcon, Add as AddIcon, Keyboard } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Button, Card, CardContent, Fab, MenuItem, Stack, InputAdornment, TextField, Grid, Typography } from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export const Form = () => {

  const dispatch = useDispatch();

  const networkStatus = useSelector((state) => state.networkStatus);

  const { pid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [marcas, setMarcas] = useState([]);

  const [tipoproductos, setTipoproductos] = useState([]);

  const [unidades, setUnidades] = useState([]);

  const [o, { defaultProps, validate, set }] = useFormState(useState, {
    activo: '1'
  }, {});

  useEffect(() => {
    dispatch({ type: 'title', title: (pid ? 'Actualizar' : 'Registrar') + ' Persona' });
    [].forEach(async (e) => {
      e[1](await db[e[0]].toArray());
    });
  }, []);

  useEffect(() => {
    if (pid) {
      if (networkStatus.connected) {
        http.get(process.env.REACT_APP_PATH + '/producto/' + pid).then((result) => {
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
    fetchData()
  }, []);

  const fetchData = async () => {
    if (networkStatus.connected) {
      const result = await (http.get(process.env.REACT_APP_PATH + '/marca'));
      setMarcas(result);

      const resultTP = await (http.get(process.env.REACT_APP_PATH + '/tipoproducto'));
      setTipoproductos(resultTP);

      const resultU = await (http.get(process.env.REACT_APP_PATH + '/unidad'));
      setUnidades(resultU);
    }
  };

  const onClickCancel = () => {
    navigate(-1);
  }

  const onClickAdd = async () => {
    navigate('/producto/create', { replace: true });
  }

  const onClickSave = async () => {
    const form = formRef.current;
    if (0 || form != null && validate(form)) {
      if (networkStatus.connected) {
        o.marca = { id: o.marca };
        o.unidad = { id: o.unidad };
        o.tipoproducto = { id: o.tipoproducto };
        o.cantidadDisponible = parseFloat(o.cantidadDisponible);

        http.post(process.env.REACT_APP_PATH + '/producto', o).then(async (productoResult) => {
          console.log(productoResult);
          if (productoResult) {
            if (!o._id) {
              if (productoResult.id) {
                let producto = { id: productoResult.id };
                http.post(process.env.REACT_APP_PATH + '/stock', { cantidadDisponible: o.cantidadDisponible, producto }).then(async (stockResult) => {
                  if (!o._id) {
                    if (stockResult.id) {
                      dispatch({ type: "snack", msg: 'Registro grabado!' });
                      navigate('/producto', { replace: true });
                    }
                    else {
                      navigate(-1);
                    }
                  }
                });
              }
              else {
                navigate(-1);
              }
            }
          } else {
            o.marca = '';
            o.unidad = '';
            o.tipoproducto = '';
          }
        });
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

  function getContent() {
    return <LocalizationProvider dateAdapter={AdapterDayjs}><ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>

          <Card className='mt-1 bs-black'>

            <CardContent>
              <Typography gutterBottom variant="h5" className='text-center fw-bold color-gore'>
                DATOS DEL PRODUCTO
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <TextField
                    className='select'
                    select
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione el Tipo de Producto: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("tipoproducto")}
                  >
                    {tipoproductos.map((item, i) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Ingrese el Codigo del Producto: "
                    placeholder="Codigo"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("codigo", { required: false })}
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
                    label="Ingrese el Nombre del Producto: "
                    placeholder="Producto"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("nombre")}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    className='select'
                    select
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione la Marca: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("marca")}
                  >
                    {marcas.map((item, i) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    className='select'
                    select
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione la Unidad: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("unidad")}
                  >
                    {unidades.map((item, i) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.cantidad} {item.nombre} ({item.abreviatura})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Ingrese el Stock Inicial: "
                    placeholder="Stock Inicial"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("cantidadDisponible")}
                  />
                </Grid>
              </Grid>

              <Grid container>
                <Grid item xs={12} md={4}>
                  <TextField
                    className='select'
                    select
                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione el Estado: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("activo")}
                  >
                    <MenuItem value={1}>Activo</MenuItem>
                    <MenuItem value={0}>Inactivo</MenuItem>
                  </TextField>
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