import React, { useState, useEffect, createRef } from 'react';
import { useFormState, useResize, http } from 'gra-react-utils';
import { db } from '../../db';
import { Send as SendIcon, Add as AddIcon, Keyboard } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Button, Card, CardContent, Fab, MenuItem, Stack, InputAdornment, TextField, Grid, Typography, Paper, Select } from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export const Form = () => {

  const dispatch = useDispatch();

  const networkStatus = useSelector((state) => state.networkStatus);

  const { pid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);

  const [instituciones, setInstituciones] = useState([]);

  const [tipocompras, setTipocompras] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  const [productos, setProductos] = useState([]);

  const [registroSalida, setRegistroSalida] = useState([]);

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [totalProductos, setTotalProductos] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [cantidad, setCantidad] = useState(0);

  const [precio, setPrecio] = useState(0);

  const [lotesDisponibles, setLotesDisponibles] = useState([]);

  const [editorData, setEditorData] = useState('');

  const [editorDataRef, setEditorDataRef] = useState('APOYO LOGISTICO PROPORCIONADO POR EL PLATAFORMA REGIONAL DE DEFENSA NACIONAL  CIVIL SEGURIDAD CIUDADANA, PARA LA ATENCION A LA FAMILIA DAMNIFICADA Y AFECTADAS POR XXXXXX, PARA LO CUAL SE ENTREGAN BIENES DE AYUDA HUMANITARIA. XXXXXX.');

  const { width, height } = useResize(React);

  const [selectedLoteId, setSelectedLoteId] = useState(''); // Define el estado y su función de actualización

  const pad = (num, places) => String(num).padStart(places, '0');

  const [o, { defaultProps, validate, set }] = useFormState(useState, {
    activo: '1',
    solicitante: 'PLATAFORMA XXXXX DE GESTION DE RIESGO DE DESASTRES DE XXXXX',
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
        http.get(process.env.REACT_APP_PATH + '/persona/' + pid).then((result) => {
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

      const resultI = await (http.get(process.env.REACT_APP_PATH + '/institucion'));
      setInstituciones(resultI);

    }
  };

  useEffect(() => {
    // Realiza la llamada a la API para cargar los productos de la página actual
    const fetchData = async () => {
      const resultProd = await http.get(
        process.env.REACT_APP_PATH + '/producto/stock/' + page + '/' + rowsPerPage
      );
      setProductos(resultProd.content);
      setTotalProductos(resultProd.totalElements);
    };

    fetchData();
  }, [page, rowsPerPage]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDoubleClick = async (product) => {
    setSelectedProduct(product);
    setCantidad(0); // Inicializa la cantidad en 0
    setPrecio(product.producto.precio); // Inicializa el precio con el precio del producto

    const response = await http.get(`${process.env.REACT_APP_PATH}/lote/disponibles/${product.producto.id}`);

    setLotesDisponibles(response);
  };

  const handleAddToRegistro = () => {
    if (cantidad > 0) {
      const selectedLote = lotesDisponibles.find((lote) => lote.id === o.lote);

      if (cantidad > selectedLote.detalleingreso.cantidadReal) {
        // Handle the case of excess quantity, show an error message or handle it as needed.
        dispatch({ type: "alert", msg: 'La cantidad ingresada supera el stock del lote seleccionado.!' });
      } else {
        const existingProductIndex = registroSalida.findIndex(
          (item) => item.producto.id === selectedProduct.producto.id && item.lote === selectedLote.nombre
        );

        if (existingProductIndex !== -1) {
          // If the product with the same lot already exists in the output record, simply increment the quantity
          const existingProduct = registroSalida[existingProductIndex];
          existingProduct.cantidad += parseInt(cantidad);
        } else {
          // If the product doesn't exist in the record, create a new entry
          const productoAgregado = {
            producto: selectedProduct.producto,
            cantidad: parseInt(cantidad),
            precio: parseFloat(precio),
            lote: selectedLote.nombre,
            idLote: selectedLote.id,
          };
          setRegistroSalida([...registroSalida, productoAgregado]);
        }
      }

      setSelectedProduct(null);
      setCantidad(0);
      setPrecio(0);
    }
  };

  const handleRemove = (product) => {
    setRegistroSalida(registroSalida.filter((item) => item.producto.id !== product.producto.id || item.precio !== product.precio));
  };

  const handleIncrement = (product) => {
    const incrementAmount = 1; // Incremento en 1
    const updatedRegistro = registroSalida.map((item) => {
      if (item.producto.id === product.producto.id && item.precio === product.precio) {
        return { ...item, cantidad: item.cantidad + incrementAmount };
      }
      return item;
    });
    setRegistroSalida(updatedRegistro);
  };

  const calculateTotalPrice = () => {
    let totalGeneral = 0;
    const updatedRegistro = registroSalida.map((item) => {
      const precioTotal = item.cantidad * item.precio;
      totalGeneral += precioTotal;
      return { ...item, precioTotal };
    });
    return { updatedRegistro, totalGeneral };
  };

  const { updatedRegistro, totalGeneral } = calculateTotalPrice();

  const productosFiltrados = productos.filter((producto) =>
    producto.producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onClickSearchPersona = async () => {
    if (o.dni) {
      const nuevaPersona = await http.get(process.env.REACT_APP_PATH + '/persona/buscar?dni=' + o.dni);
      if (nuevaPersona) {
        o.idPersona = nuevaPersona.id;
        set(o => ({ ...o, apellidoNombre: nuevaPersona.apellidoNombre }), () => {
          o.apellidoNombre = nuevaPersona.apellidoNombre;
        });
      } else {
        o.idPersona = "";
        set(o => ({ ...o, apellidoNombre: "" }), () => {
          o.apellidoNombre = "";
        });
        dispatch({ type: "alert", msg: 'Ingrese sus Datos Personales' });
      }
    } else {
      dispatch({ type: "alert", msg: 'Ingrese el número de DNI' });
    }
  }

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
        var fecha = o.fecha.toDate ? o.fecha.toDate() : o.fecha;
        var day = pad(fecha.getDate(), 2);
        var month = pad(fecha.getMonth() + 1, 2);
        var year = fecha.getFullYear();
        o.fecha = year + '-' + month + '-' + day;
        o.anio = year;
        o.costoTotal = totalGeneral;

        o.institucion = { id: o.institucion };

        if (o.idPersona === "") {
          const nuevaPersona = await http.post(process.env.REACT_APP_PATH + '/persona', { nroDocumento: o.dni, apellidoNombre: o.apellidoNombre });
          if (nuevaPersona) {
            o.idPersona = nuevaPersona.id;
          } else {
            o.idPersona = "";
          }
        }

        o.persona = { id: o.idPersona };

        http.post(process.env.REACT_APP_PATH + '/salida', o).then(async (salidaResult) => {
          console.log(salidaResult);
          if (salidaResult && salidaResult.id) {
            for (let i = 0; i < registroSalida.length; i++) {
              const detalleSalida = {
                cantidad: registroSalida[i].cantidad,
                costoUnitario: registroSalida[i].precio,
                costoTotal: registroSalida[i].cantidad * registroSalida[i].precio,
                salida: { id: salidaResult.id },
                producto: { id: registroSalida[i].producto.id },
                lote: { id: registroSalida[i].idLote }
              };

              // Realizar la solicitud POST para crear el detalle de salida actual
              const nuevoDetalle = await http.post(process.env.REACT_APP_PATH + '/detallesalida/registrar', detalleSalida);

              if (nuevoDetalle.id) {
                dispatch({ type: "snack", msg: 'Registro grabado!' });
                navigate('/salidaproducto', { replace: true });

                // Actualizar la cantidadReal del lote
                const loteId = registroSalida[i].idLote;
                const cantidadUtilizada = registroSalida[i].cantidad;

                // Realizar una solicitud GET para obtener la cantidadReal actual del lote
                const response = await http.get(`${process.env.REACT_APP_PATH}/lote/${loteId}`);
                const loteActual = response;
                if (loteActual) {
                  const cantidadRealActual = loteActual.cantidadReal;
                  const nuevaCantidadReal = cantidadRealActual + cantidadUtilizada;

                  // Realizar una solicitud PUT para actualizar la cantidadReal del lote
                  await http.put(`${process.env.REACT_APP_PATH}/lote/${loteId}/actualizarCantidadReal?cantidadReal=${nuevaCantidadReal}`);
                }
              } else {
                navigate(-1);
              }
            }
          } else {
            navigate(-1);
          }
        });
      }
    } else {
      dispatch({ type: "alert", msg: 'Falta campos por completar!' });
    }
  };

  const onSubmit = data => console.log(data);

  function onChangeFecha(v) {
    set(o => ({ ...o, fecha: v }), () => {
      o.fecha = v;
    });
  }

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
                SALIDA DE PRODUCTOS
              </Typography>

              <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>

                <Grid container spacing={1}>
                  <Grid item xs={12} md={9}>
                    <TextField
                      required
                      fullWidth
                      size='small'
                      id="standard-name"
                      label="Ingrese la Dependencia Solicitante: "
                      placeholder="Dependencia Solicitante"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("solicitante")}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      required
                      size='small'
                      fullWidth
                      id="standard-name"
                      label="Número: "
                      placeholder="Número"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("numero")}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={1}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      required
                      fullWidth
                      size='small'
                      id="standard-name"
                      label="Ingrese Nº DNI: "
                      placeholder="DNI"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("dni")}
                    />
                  </Grid>

                  <Grid item xs={12} md={1} container justifyContent="center" alignItems="center">
                    <Button variant="contained" color='primary' onClick={onClickSearchPersona} size='small' fullWidth>
                      Buscar
                    </Button>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <TextField
                      required
                      fullWidth
                      size='small'
                      id="standard-name"
                      label="Ingrese los Apellidos y Nombres: "
                      placeholder="Apellidos y Nombres"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("apellidoNombre")}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={1}>
                  <Grid item xs={12} md={9}>
                    <TextField
                      className='select'
                      select
                      margin="normal"
                      size='small'
                      required
                      fullWidth
                      id="standard-name"
                      label="Seleccione con Atención a: "
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("institucion")}
                    >
                      {instituciones.map((item, i) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <DesktopDatePicker
                      label="Fecha:"
                      inputFormat="DD/MM/YYYY"
                      value={o.fecha || ''}
                      onChange={onChangeFecha}
                      renderInput={(params) =>
                        <TextField
                          type={'number'}
                          sx={{ fontWeight: 'bold' }}
                          margin="normal"
                          size='small'
                          required
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Keyboard />
                              </InputAdornment>
                            ),
                          }}
                          {...params}
                        // {...defaultProps("fecha")}
                        />}
                    />
                  </Grid>
                </Grid>
              </Paper>

              <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>
                {/* <Typography variant="h5">Lista de Productos</Typography> */}
                <TextField
                  size='small'
                  label="Buscar productos"
                  variant="outlined"
                  onChange={handleSearch}
                />
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Precio</TableCell>
                      <TableCell>Stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productosFiltrados.map((producto) => (
                      <TableRow key={producto.producto.id} onDoubleClick={() => handleDoubleClick(producto)}>
                        <TableCell>
                          {producto.producto.marca.nombre !== "SIN MARCA" ? (
                            `${producto.producto.nombre} - ${producto.producto.marca.nombre} X ${producto.producto.unidad.cantidad} ${producto.producto.unidad.abreviatura}`
                          ) : (
                            `${producto.producto.nombre} X ${producto.producto.unidad.cantidad} ${producto.producto.unidad.abreviatura}`
                          )}
                        </TableCell>
                        <TableCell>S/. {producto.producto.precio}</TableCell>
                        <TableCell>{producto.cantidadDisponible}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={totalProductos}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />

                {selectedProduct && (
                  <div>
                    <Typography variant='h6'>Detalles del Producto Seleccionado</Typography>
                    <TextField
                      size='small'
                      label="Nombre del Producto"
                      value={selectedProduct.producto.nombre}
                      disabled
                    />
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={2}>
                        <TextField
                          size='small'
                          label="Cantidad"
                          type="number"
                          value={cantidad}
                          onChange={(e) => setCantidad(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          size='small'
                          type="number"
                          value={precio}
                          onChange={(e) => setPrecio(e.target.value)}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          size='small'
                          label="Precio Total"
                          type="number"
                          value={cantidad * precio}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <TextField
                          className='select'
                          margin="normal"
                          size='small'
                          select
                          required
                          fullWidth
                          id="standard-name"
                          label="Seleccione el Lote: "
                          value={selectedLoteId}
                          onChange={(e) => setSelectedLoteId(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Keyboard />
                              </InputAdornment>
                            ),
                          }}
                          {...defaultProps("lote")}
                        >
                          {lotesDisponibles.map((lote) => (
                            <MenuItem key={lote.id} value={lote.id}>
                              {`${lote.nombre} - Cantidad Disponible: ${lote.cantidad - lote.cantidadReal}`}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={1} container justifyContent="center" alignItems="center">
                        <Button size='small' variant="contained" color='primary' onClick={handleAddToRegistro}>
                          Añadir
                        </Button>
                      </Grid>
                    </Grid>
                  </div>
                )}
              </Paper>

              <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>
                <Grid container>
                  <h2 style={{ marginTop: 0 }}>REGISTRO DE SALIDA</h2>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Cantidad</TableCell>
                        <TableCell>Precio</TableCell>
                        <TableCell>Precio Total</TableCell>
                        <TableCell>Lote</TableCell>
                        <TableCell>Eliminar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {updatedRegistro.map((producto) => (
                        <TableRow key={producto.producto.id + producto.precio}>
                          <TableCell>{producto.producto.nombre}</TableCell>
                          <TableCell>
                            {producto.cantidad}
                            <Button onClick={() => handleIncrement(producto)}>+</Button>
                          </TableCell>
                          <TableCell>S/. {producto.precio}</TableCell>
                          <TableCell>S/. {producto.precioTotal}</TableCell>
                          <TableCell>{producto.lote}</TableCell>
                          <TableCell>
                            <Button onClick={() => handleRemove(producto)}>Eliminar</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div>
                    <h3>Precio Total General: {totalGeneral}</h3>
                  </div>
                </Grid>
              </Paper>

              <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>
                <Grid item xs={12} md={3}>
                  <h3 style={{ marginTop: 0 }}>DESCRIPCIÓN</h3>
                  <CKEditor
                    editor={ClassicEditor}
                    data={editorData}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorData(data);
                      o.descripcion = data;
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <h3>REFERENCIA</h3>
                  <CKEditor
                    editor={ClassicEditor}
                    data={editorDataRef}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorDataRef(data);
                      o.referencia = data;
                    }}
                  />
                </Grid>
              </Paper>
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
    </ThemeProvider></LocalizationProvider >
  }
  return <>{
    1 == 1 ? <Box style={{ textAlign: 'left' }}>{getContent()}</Box>
      : <Box
        sx={{ display: 'flex' }}>
      </Box>
  }
  </>;

}