import React, { useState, useEffect, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Checkbox, Fab, styled, Table, TableCell, TablePagination, TableHead, TableBody, TableRow, TableContainer, Toolbar, Grid, Card, CardContent, Paper } from '@mui/material';
import { Autorenew, Padding } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Typography from '@mui/material/Typography';
import { Send as SendIcon } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    textAlign: 'center',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const List = () => {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [result, setResult] = useState({ size: 0, data: [] });

  const [details, setDetails] = useState({ size: 0, data: [] });

  const [selected, setSelected] = React.useState([]);

  const isSelected = (code) => selected.indexOf(code) !== -1;

  const networkStatus = useSelector((state) => state.networkStatus);

  const pad = (num, places) => String(num).padStart(places, '0');

  const componentRef = useRef();

  const { pid } = useParams();

  const onChangeAllRow = (event) => {
    if (event.target.checked) {
      const newSelected = result.data.map((row) => toID(row));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const onClickRow = (event, code) => {
    const selectedIndex = selected.indexOf(code);

    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, code);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const emptyRows = result.data && result.data.length;

  const onPageChange = (
    event, page
  ) => {
    setState({ ...state, page: page });
  };

  const onRowsPerPageChange = (
    event
  ) => {
    setState({ ...state, rowsPerPage: event.target.value });
  };

  const onClickRefresh = () => {
    setSelected([]);
    fetchData(state.page);
  }

  const fetchData = async (page) => {
    if (networkStatus.connected) {
      const result = await http.get(process.env.REACT_APP_PATH + '/ingreso/' + pid);
      setResult(result);

      const details = await http.get(process.env.REACT_APP_PATH + '/detalleingreso/details/' + pid);
      setDetails(details);
    }
  };

  const { height, width } = useResize(React);

  useEffect(() => {
    const header = document.querySelector('.MuiToolbar-root');
    const tableContainer = document.querySelector('.MuiTableContainer-root');
    const nav = document.querySelector('nav');
    const toolbarTable = document.querySelector('.Toolbar-table');
    const tablePagination = document.querySelector('.MuiTablePagination-root');

    if (tableContainer) {
      tableContainer.style.width = (width - nav.offsetWidth) + 'px';
      tableContainer.style.height = (height - header.offsetHeight
        - toolbarTable.offsetHeight - tablePagination.offsetHeight) + 'px';
    }
  }, [height, width]);

  useEffect(() => {
    dispatch({ type: 'title', title: 'NOTA DE ENTRADA A ALMACÉN' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  const createOnClick = () => {
    navigate('/ingresoproducto/create');
  };

  const editOnClick = () => {
    navigate('/ingresoproducto/' + selected[0] + '/edit');
  }

  const deleteOnClick = () => {
    dispatch({
      type: "confirm", msg: 'Esta seguro de eliminar el registro seleccionado?', cb: (e) => {
        if (e) {
          http.delete('/ingresoproducto/' + selected.join(',')).then((result) => {
            dispatch({ type: 'snack', msg: 'Registro' + (selected.length > 1 ? 's' : '') + ' eliminado!' });
            onClickRefresh();
          });
        }
      }
    });
  };

  function getCellClass(value) {
    // Supongamos que tienes el valor de fecha en formato UNIX timestamp
    const fechaUnixTimestamp = value;

    // Crea una instancia del objeto Date y pasa el valor del timestamp
    const fecha = new Date(fechaUnixTimestamp);

    // Obtén los componentes de la fecha (día, mes y año)
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses en JavaScript son de 0 a 11, así que suma 1
    const anio = fecha.getFullYear();

    // Formatea la fecha en el formato dd-mm-YYYY
    const fechaFormateada = `${pad(dia, 2)}-${pad(mes, 2)}-${anio}`;

    return fechaFormateada;
  }

  const onClickPrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Reporte de Pacientes por Rango de Edad.',
    onAfterPrint: () => dispatch({ type: "snack", msg: 'Reporte de Atenciones por Edad impreso.!' }),
  });

  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <>
      <Grid item xs={12} md={2} className='mt-1-5' sx={{ padding: '5px', paddingTop: '1em' }}>
        <Button sx={{ width: '100%', fontWeight: 'bold' }} variant="contained" onClick={onClickPrint} color="primary" startIcon={<SendIcon />}>
          Imprimir
        </Button>
      </Grid>
      <Card ref={componentRef}>
        <CardContent>
          {result && (
            <>
              <Typography variant="h5" component="div" sx={{ marginBottom: '1em', textAlign: 'center', fontWeight: 'bold' }}>
                NOTA DE ENTRADA A ALMACÉN
              </Typography>
              <Grid container spacing={1} sx={{ textAlign: 'left' }}>
                <Grid item md={8}>
                  <Typography variant="subtitle1" gutterBottom>
                    {/* PROCEDENCIA: {result.proveedor.nombre} */}
                    PROCEDENCIA: {result.proveedor && result.proveedor.nombre ? result.proveedor.nombre : 'N/A'}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'left' }}>
                    CON DESTINO A: {result.destino}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'left' }}>
                    ATENCIÓN: {result.institucion && result.institucion.nombre ? result.institucion.nombre : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center', border: 'solid 1px #000' }}>
                    Nº
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: 'center', border: 'solid 1px #000' }}>001-2023</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center', border: 'solid 1px #000' }}>
                    DIA
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: 'center', border: 'solid 1px #000' }}>14</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center', border: 'solid 1px #000' }}>
                    MES
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: 'center', border: 'solid 1px #000' }}>03</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle1" sx={{ textAlign: 'center', border: 'solid 1px #000' }} gutterBottom>
                    AÑO
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: 'center', border: 'solid 1px #000' }}>2023</Typography>
                </Grid>
              </Grid>

              {/* ... Otros detalles ... */}

              {details && details.length > 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell colSpan={3} sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>1.- ARTICULO</TableCell>
                        <TableCell colSpan={1} sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'> </TableCell>
                        <TableCell colSpan={2} sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>2.- VALORES</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>A - CODIGO</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>B - CANTIDAD</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>C - DESCRIPCION</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>D - UNIDAD DE MEDIDA</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>A - UNITARIO</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>B - TOTAL</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details.map((detalle) => (
                        <TableRow key={toID(detalle)}>
                          <TableCell sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>{detalle.producto.codigo}</TableCell>
                          <TableCell sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>{detalle.cantidad}</TableCell>
                          <TableCell sx={{ padding: '0px', margin: '0px' }} className='border-table-black'>{detalle.producto.marca.nombre !== "SIN MARCA" ? (
                            `${detalle.producto.nombre} - ${detalle.producto.marca.nombre} X ${detalle.producto.unidad.cantidad} ${detalle.producto.unidad.abreviatura}`
                          ) : (
                            `${detalle.producto.nombre} X ${detalle.producto.unidad.cantidad} ${detalle.producto.unidad.abreviatura}`
                          )}</TableCell>
                          <TableCell sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>{detalle.producto.unidad.nombre}</TableCell>
                          <TableCell sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>S/. {detalle.costoUnitario}</TableCell>
                          <TableCell sx={{ textAlign: 'center', padding: '0px', margin: '0px' }} className='border-table-black'>S/. {detalle.costoTotal}</TableCell>
                        </TableRow>
                      ))}

                      <TableRow>
                        <TableCell className='border-table-black'> </TableCell>
                        <TableCell colSpan={2} className='border-table-black'>
                          <div dangerouslySetInnerHTML={{ __html: result.descripcion }} />
                        </TableCell>
                        <TableCell className='border-table-black'></TableCell>
                        <TableCell className='border-table-black'></TableCell>
                        <TableCell className='border-table-black'></TableCell>
                      </TableRow>

                      <TableRow className='border-table-black'>
                        <TableCell className='border-table-black' colSpan={5} sx={{ fontWeight: 'bold', textAlign: 'center' }}>TOTAL</TableCell>
                        <TableCell className='border-table-black'>S/. {result.costoTotal}</TableCell>
                      </TableRow>

                      <TableRow>
                        .
                      </TableRow>

                      <TableRow className='border-table-white'>
                        <TableCell className='border-table-white' sx={{ padding: '0px', margin: '0px' }}></TableCell>
                        <TableCell className='border-table-white' colSpan={2} sx={{ fontWeight: 'bold', padding: '0px', margin: '0px' }}>Cuentas de Mayor</TableCell>
                        <TableCell className='border-table-white' colSpan={3} sx={{ fontWeight: 'bold', padding: '0px', margin: '0px' }}>Procedencia</TableCell>
                      </TableRow>

                      <TableRow className='border-table-white'>
                        <TableCell className='border-table-white' sx={{ padding: '0px', margin: '0px' }}></TableCell>
                        <TableCell className='border-table-white' colSpan={2} sx={{ fontWeight: 'bold', padding: '0px', margin: '0px' }}>S/. {result.costoTotal}</TableCell>
                        <TableCell className='border-table-white' colSpan={3} sx={{ fontWeight: 'bold', padding: '0px', margin: '0px' }}>{result.tipocompra.nombre}</TableCell>
                      </TableRow>

                      <TableRow sx={{ color: 'white' }}>
                        .
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={6} className='border-table-black' sx={{ fontWeight: 'bold' }}>RECIBÍ CONFORME</TableCell>
                      </TableRow>

                      <TableRow sx={{ color: 'white' }}>
                        .
                      </TableRow>
                      <TableRow sx={{ color: 'white' }}>
                        .
                      </TableRow>
                      <TableRow sx={{ color: 'white' }}>
                        .
                      </TableRow>
                      <TableRow sx={{ color: 'white' }}>
                        .
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={2} sx={{ fontWeight: 'bold', textAlign: 'center', borderTop: '1px solid #000 !important' }}>Responsable de Almacen Regional - BAH</TableCell>
                        <TableCell></TableCell>
                        <TableCell colSpan={3} sx={{ fontWeight: 'bold', textAlign: 'center', borderTop: '1px solid #000 !important' }}>Jefe-ORDN-GRA</TableCell>

                      </TableRow>

                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* ... Otros detalles y suma total ... */}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );

};

export default List;